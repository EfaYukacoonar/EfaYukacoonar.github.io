import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// --- 1. 世界の基本セットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. ライトとマップ（地面・箱） ---
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

// --- 3. 操作の設定（視点とキーボード） ---
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => { controls.lock(); });

// キーボードの状態を記録する箱
const keys = { w: false, a: false, s: false, d: false };

// キーが押されたら true、離されたら false にする
document.addEventListener('keydown', (e) => { 
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});
document.addEventListener('keyup', (e) => { 
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
});

// --- 4. 描画ループ（ここで毎フレーム移動を計算） ---
const moveSpeed = 0.15; // 歩く速さ
const velocity = new THREE.Vector3(); // 移動する方向を計算するための変数

function animate() {
    requestAnimationFrame(animate);

    // 移動の計算（W/A/S/Dが押されている間だけ座標を動かす）
    if (controls.isLocked) {
        const direction = new THREE.Vector3();
        const front = new THREE.Vector3();
        const side = new THREE.Vector3();

        // カメラの向きを取得
        camera.getWorldDirection(front);
        front.y = 0; // 上下に飛ばないように
        front.normalize();

        // 横方向を計算
        side.crossVectors(front, new THREE.Vector3(0, 1, 0));

        // 実際に座標を足し算する
        if (keys.w) camera.position.addScaledVector(front, moveSpeed);
        if (keys.s) camera.position.addScaledVector(front, -moveSpeed);
        if (keys.a) camera.position.addScaledVector(side, -moveSpeed);
        if (keys.d) camera.position.addScaledVector(side, moveSpeed);
    }

    renderer.render(scene, camera);
}

// --- 5. 射撃と反動のシステム ---
let recoilAmount = 0; // 現在の反動の蓄積

function shoot() {
    // 1. 弾道の作成（細長い光る棒）
    const tracerGeo = new THREE.BoxGeometry(0.01, 0.01, 10);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); // 白い弾道
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    // 2. カメラの位置と向きに合わせる
    camera.getWorldDirection(new THREE.Vector3()); // 方向更新用
    tracer.position.copy(camera.position);
    tracer.quaternion.copy(camera.quaternion);
    tracer.translateZ(-5); // 自分の少し前から飛ばす

    scene.add(tracer);

    // 3. 反動（リコイル）: 撃つたびに視点を少し上に向ける
    camera.rotation.x += 0.02; 
    recoilAmount += 0.05; // 撃ち続けると蓄積する（後で散弾計算に使えるよ）

    // 4. 0.05秒後に弾道を消す（残像効果）
    setTimeout(() => {
        scene.remove(tracer);
    }, 50);
}

// マウスをクリックした時のイベント
document.addEventListener('mousedown', (e) => {
    // 左クリック(0)かつロック中なら発射
    if (controls.isLocked && e.button === 0) {
        shoot();
    }
});

animate();

// リサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});