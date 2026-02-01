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

export function getCoriolisAcceleration(vx, vy, vz) {
    ax: 2 * WGS84.omega * vy,
    ay: -2 * WGS84.omega * vx,
    az: 0
};