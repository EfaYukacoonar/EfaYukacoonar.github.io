const WGS84 = {
    a: 6378137.0,
    f: 1 / 298.257223563,
    get b () {
        return this.a * (1 - this.f);
    },
    get e2() {
        return (2 * this.f) - (this.f * this.f);
    },
    omega: 7.292115e-5,
    GM: 3.986004418e14
}

export function geoToECEF(lat, lon, alt) {
    const radLat = lat * Math.PI / 180;
    const radLon = lon * Math.PI / 180;
    const N = WGS84.a / Math.sqrt(1 - WGS84.e2 * Math.sin(radLat)**2);
    const x = (N + alt) * Math.cos(radLat) * Math.cos(radLon);
    const y = (N + alt) * Math.cos(radLat) * Math.sin(radLon);
    const z = (N * (1 - WGS84.e2) + alt) * Math.sin(radLat);

    return {x, y, z};
}

export function getNormalGravity(lat) {
    const radLat = lat * Math.PI / 180;
    const sin2 = Math.sin(radLat)**2;
    const ge = 9.7803253359;
    const gp = 9.8321849378;
    const k = (WGS84.b * gp) / (WGS84.a * ge) - 1;
    const g0 = ge * (1 + k * sin2) / Math.sqrt(1 - WGS84.e2 * sin2);

    return g0;
}

export function getGravityAtAltitude(lat, alt) {
    const g0 = getNormalGravity(lat);
    return g0 * Math.pow(WGS84.a / (WGS84.a + alt), 2);
}

export function getCoriolisAcceleration(vx, vy, vz) {
    return{
        ax: 2 * WGS84.omega * vy,
        ay: -2 * WGS84.omega * vx,
        az: 0
    };
}

export function getAirDensity(alt, env) {
    const R = 287.058;
    const g0 = 9.80665;

    const pressureScale = env.pressure / 1013.25;

    const layers = [
        {h: 0, L: -0.0065, T: env.temp + 273.15, P: (env.pressure * 100)},
        {h: 11000, L: 0, T: 216.65, P: 22632.1 * pressureScale },
    ]
    if (alt > 44330) return 0;
    
    const T0 = env.temp + 273.15;
    const T = T0 - 0.0065 * alt;
    if (T <= 0) return 0;

    const P = env.pressure * Math.pow(T / T0, 5.257);

    const tc = T - 273.15;
    const es = 6.11 * Math.pow(10, (7.5 * tc) / (tc + 237.3));
    const e = (env.humidity / 100) * es;

    const virtualTemp = T / (1 - (e / P) * 0.378);
    const density = (P * 100) / (287.058 * virtualTemp);

    return density;
}

export const EARTH_AXIS_TILT = 23.439;