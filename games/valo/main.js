import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// --- 1. 基本セットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. プレイヤーの物理パラメータ ---
const player = {
    height: 1.6,
    crouchHeight: 0.8,
    isCrouching: false,
    canJump: false,
    velocity: new THREE.Vector3(),
    speed: 0.15
};

// --- 3. 操作の設定 ---
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject()); // カメラをコントロールオブジェクトとしてシーンに追加

document.addEventListener('click', () => { controls.lock(); });

const keys = { w: false, a: false, s: false, d: false, isMoving: false };

document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = true;
    if (key === 'a') keys.a = true;
    if (key === 's') keys.s = true;
    if (key === 'd') keys.d = true;

    if (e.code === 'Space' && player.canJump) {
        player.velocity.y += 0.15; // ジャンプ力
        player.canJump = false;
    }
    if (e.code === 'ControlLeft' || e.key === 'Control') {
        player.isCrouching = true;
        player.speed = 0.07;
    }
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'w') keys.w = false;
    if (key === 'a') keys.a = false;
    if (key === 's') keys.s = false;
    if (key === 'd') keys.d = false;

    if (e.code === 'ControlLeft' || e.key === 'Control') {
        player.isCrouching = false;
        player.speed = 0.15;
    }
});

// マウスダウンで射撃
window.addEventListener('mousedown', (e) => {
    // PointerLockが有効な時だけ撃てる
    if (controls.isLocked) {
        shoot();
    }
});

// --- 4. 地面とターゲットの作成 ---
const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1);
scene.add(light);
scene.add(new THREE.GridHelper(100, 100));

for (let i = 0; i < 20; i++) {
    const size = Math.random() * 2 + 1;
    const box = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff })
    );
    box.position.set((Math.random() - 0.5) * 40, size / 2, (Math.random() - 0.5) * 40);
    scene.add(box);
}

// --- 5. 射撃・リコイルシステム ---
let shotCount = 0;
let lastShotTime = 0;
let recoilX = 0;
let recoilY = 0;

function shoot() {
    const now = Date.now();
    if (now - lastShotTime > 200) shotCount = 0;
    lastShotTime = now;
    shotCount++;

    // トレーサー（弾道）の作成
    const tracerGeo = new THREE.BoxGeometry(0.01, 0.01, 20);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    // 拡散（スプレー）計算
    let spread = Math.min(shotCount * 0.01, 0.1);
    if (!player.canJump) spread += 0.1; // ジャンプ中はガバガバ
    else if (keys.w || keys.a || keys.s || keys.d) spread += 0.03; // 移動中
    if (player.isCrouching) spread *= 0.5; // しゃがみは正確

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    tracer.position.copy(camera.position);
    tracer.lookAt(camera.position.clone().add(direction));
    tracer.translateZ(-10);
    scene.add(tracer);

    // 反動（カメラを直接回さず、数値だけ蓄積してupdateRecoilで処理）
    recoilY += (shotCount < 5 ? 0.02 : 0.005);
    recoilX += (shotCount > 5 ? (Math.random() - 0.5) * 0.02 : 0);

    setTimeout(() => { scene.remove(tracer); }, 40);
}

// --- 6. アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        // 移動
        if (keys.w) controls.moveForward(player.speed);
        if (keys.s) controls.moveForward(-player.speed);
        if (keys.a) controls.moveRight(-player.speed);
        if (keys.d) controls.moveRight(player.speed);

        // 重力とジャンプ
        player.velocity.y -= 0.008; // 重力強め
        controls.getObject().position.y += player.velocity.y;

        // しゃがみと地面判定
        const currentTargetHeight = player.isCrouching ? player.crouchHeight : player.height;
        if (controls.getObject().position.y < currentTargetHeight) {
            controls.getObject().position.y = currentTargetHeight;
            player.velocity.y = 0;
            player.canJump = true;
        }

        // リコイルの適用と回復
        if (recoilY > 0 || Math.abs(recoilX) > 0) {
            camera.rotation.x += recoilY * 0.1; // じわっと上げる
            camera.rotation.y += recoilX * 0.1;
            
            // 回復
            recoilY *= 0.9; 
            recoilX *= 0.9;
        }
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
