import { getEnvironmentData } from './environment.js';
import { getAirDensity } from './earth.js';

async function testPhysicalEngine() {
    console.log("気象データを取得中...");
    
    // 例として東京の緯度・経度（好きな場所で試して！）
    const lat = 35.6895;
    const lon = 139.6917;

    const env = await getEnvironmentData(lat, lon);
    
    if (env) {
        console.log(`現在の${lat}, ${lon}の天気:`, env);
        
        // 地表（高度0m）の空気密度を計算してみる
        const density = getAirDensity(0, env);
        console.log(`計算された地表の空気密度: ${density.toFixed(4)} kg/m³`);
    }
}

testPhysicalEngine();
