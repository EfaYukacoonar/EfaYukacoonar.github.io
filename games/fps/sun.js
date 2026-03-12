import { EARTH_AXIS_TILT } from "./earth";
export class Sun {
    constructor() {
        this.solarConstant = 1361;
    }
    calculatePosition(date, lat, lon) {
        //Jan 1 ~
        const start = new
        Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        //Declination
        const declination = EARTH_AXIS_TILT * Math.cos((2 * Math.PI * (dayOfYear + 10)) / 365.25);
        const radDec = (declination * Math.PI) / 180;
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
        //
        const x = Math.cos(altAngle) * Math.sin(radHA);
        const y = Math.sin(altAngle);
        const z = Math.cos(altAngle) * Math.cos(radHA);
        return {
            direction: { x, y, z },
            altitude: altAngle * (180 / Math.PI),
            intensity: this.calculateIntensity(altAngle)
        };
    }
    calculateIntensity(altAngle) {
        if (altAngle <= 0) return 0;
        const airMass = 1 / Math.max(Math.sin(altAngle), 0.001);
        return this.solarConstant * Math.pow(0.7, airMass);
    }
}