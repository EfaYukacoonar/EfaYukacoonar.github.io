import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// --- 1. 世界の基本セットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// --- プレイヤーのステータス管理（追加） ---
const player = {
    height: 1.6,
    crouchHeight: 0.8,
    isCrouching: false,
    canJump: true,
    velocity: new THREE.Vector3(),
    speed: 0.15
};
camera.position.y = player.height;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. ライトとマップ ---
const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1);
scene.add(light);
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

for (let i = 0; i < 20; i++) {
    const size = Math.random() * 2 + 1;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
    const testBox = new THREE.Mesh(geometry, material);
    testBox.position.set((Math.random() - 0.5) * 40, size / 2, (Math.random() - 0.5) * 40);
    scene.add(testBox);
}

// --- 3. 操作の設定 ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => { controls.lock(); });

const keys = { w: false, a: false, s: false, d: false, isMoving: false };

document.addEventListener('keydown', (e) => { 
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
    
    // ジャンプ（スペースキー）
    if (e.code === 'Space' && player.canJump) {
        player.velocity.y += 0.15;
        player.canJump = false;
    }
    // しゃがみ（Ctrlキー）
    if (e.code === 'ControlLeft') {
        player.isCrouching = true;
        player.speed = 0.07; // しゃがみ歩きは遅く
    }
});

document.addEventListener('keyup', (e) => { 
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;

    if (e.code === 'ControlLeft') {
        player.isCrouching = false;
        player.speed = 0.15;
    }
});

// マウスクリックで発射
document.addEventListener('mousedown', (e) => {
    if (controls.isLocked && e.button === 0) shoot();
});

// --- 4. 描画ループ（移動と物理計算） ---
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        // --- 移動計算 ---
        const front = new THREE.Vector3();
        const side = new THREE.Vector3();
        camera.getWorldDirection(front);
        front.y = 0;
        front.normalize();
        side.crossVectors(front, new THREE.Vector3(0, 1, 0));

        // 移動しているかどうかの判定
        keys.isMoving = keys.w || keys.s || keys.a || keys.d;

        if (keys.w) camera.position.addScaledVector(front, player.speed);
        if (keys.s) camera.position.addScaledVector(front, -player.speed);
        if (keys.a) camera.position.addScaledVector(side, -player.speed);
        if (keys.d) camera.position.addScaledVector(side, player.speed);

        // --- ジャンプ・重力・しゃがみ高さの物理計算 ---
        player.velocity.y -= 0.005; // 重力
        camera.position.y += player.velocity.y;

        const targetHeight = player.isCrouching ? player.crouchHeight : player.height;
        
        // 地面判定
        if (camera.position.y < targetHeight) {
            camera.position.y = targetHeight;
            player.velocity.y = 0;
            player.canJump = true;
        }

        // --- リコイルの回復 ---
        updateRecoil();
    }

    renderer.render(scene, camera);
}

// --- 5. VALORANT風リコイル・スプレーシステム（強化版） ---
let shotCount = 0;
let lastShotTime = 0;
let recoilX = 0;
let recoilY = 0;

function shoot() {
    const now = Date.now();
    if (now - lastShotTime > 200) shotCount = 0;
    lastShotTime = now;
    shotCount++;

    // 1. 弾道の作成
    const tracerGeo = new THREE.BoxGeometry(0.008, 0.008, 15);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.9 });
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    // 2. VALORANT風：状況に応じた拡散（スプレー）計算
    let baseSpread = Math.min(shotCount * 0.005, 0.1); 
    
    // ジャンプ中なら激しくバラける
    if (!player.canJump) baseSpread += 0.1;
    // 移動中なら少しバラける
    else if (keys.isMoving) baseSpread += 0.03;
    // しゃがみ中なら精度アップ
    if (player.isCrouching) baseSpread *= 0.5;

    const spreadX = (Math.random() - 0.5) * baseSpread;
    const spreadY = (Math.random() - 0.5) * baseSpread;

    // 3. 向きの設定
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.x += spreadX;
    direction.y += spreadY;
    direction.normalize();

    tracer.position.copy(camera.position);
    tracer.lookAt(camera.position.clone().add(direction));
    tracer.translateZ(-7.5);
    scene.add(tracer);

    // 4. 反動（リコイル）
    const upForce = shotCount < 5 ? 0.02 : 0.005;
    const sideForce = shotCount > 5 ? (Math.random() - 0.5) * 0.02 : 0;

    camera.rotation.x += upForce;
    camera.rotation.y += sideForce;
    recoilY += upForce;
    recoilX += sideForce;

    setTimeout(() => { scene.remove(tracer); }, 30);
}

function updateRecoil() {
    if (Date.now() - lastShotTime > 150) {
        const recoverSpeed = 0.004;
        if (recoilY > 0) {
            const step = Math.min(recoilY, recoverSpeed);
            camera.rotation.x -= step;
            recoilY -= step;
        }
        if (Math.abs(recoilX) > 0) {
            const step = Math.sign(recoilX) * Math.min(Math.abs(recoilX), recoverSpeed);
            camera.rotation.y -= step;
            recoilX -= step;
        }
    }
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
