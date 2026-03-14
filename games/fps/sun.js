import { EARTH_AXIS_TILT } from "./earth";
export class Sun {
    constructor() {
        this.solarConstant = 1361;
    }
    calculatePosition(date, lat, lon) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        //Declination
        const declination = EARTH_AXIS_TILT * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365.25);
        const radDec = (declination * Math.PI) / 180;
        //Equatuon Of Time
        const b = (2 * Math.PI * (dayOfYear - 81)) / 364;
        const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
        //Hour Angle
        const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
        const hourAngle = (hours + lon / 15 - 12) * 15;
        const radHA = (hourAngle * Math.PI) / 180;
        const radLat = (lat * Math.PI) / 180;
        //Altitude Angle
        const sinAlt = Math.sin(radLat) * Math.sin(radDec) + Math.cos(radLat) * Math.cos(radDec) * Math.cos(radHA);
        const altAngle = Math.asin(sinAlt);
        //Azimuth Angle
        const cosAs = (Math.sin(radDec) - Math.sin(altAngle) * Math.sin(radLat)) / (Math.cos(altAngle) * Math.cos(radLat));
        const asAngle = Math.acos(Math.max(-1, Math.min(1, cosAs)));
        //Atmospheric Refraction
        const altDeg = altAngle * (180 / Math.PI);
        if (altDeg > -0.5) {
            const Refraction = (1.02 / Math.tan((altDeg + 10.3 / (altDeg + 5.11)) * (Math.PI /180))) /60;
            altAngle += Refraction * (Math.PI / 180);
        }
        //Calculation Of Directional Vectors
        const x = Math.cos(altAngle) * Math.sin(radHA);
        const y = Math.sin(altAngle);
        const z = Math.cos(altAngle) * Math.cos(radHA);
        return {
            direction: { x, y, z },
            altitude: altAngle * (180 / Math.PI),
            intensity: this.calculateIntensity(altAngle, dayOfYear)
        };
    }
    calculateIntensity(altAngle, dayOfYear) {
        if (altAngle <= 0) return 0;
        const distanceCorr = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
        const io = this.solarConstant * distanceCorr;

        const airMass = 1 / Math.max(Math.sin(altAngle), 0.001);
        return this.solarConstant * Math.pow(0.7, airMass);
    }
}
