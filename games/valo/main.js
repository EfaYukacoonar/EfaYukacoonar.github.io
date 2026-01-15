import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// --- 1. 世界のセットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. ライトとマップ ---
const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1);
scene.add(light);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// テスト用の箱
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

const keys = { w: false, a: false, s: false, d: false };
document.addEventListener('keydown', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; });
document.addEventListener('keyup', (e) => { if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; });

// --- 4. 描画ループと修正ポイント ---
const moveSpeed = 0.15;
let recoilOffset = 0; // 反動でズレている量

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const front = new THREE.Vector3();
        const side = new THREE.Vector3();

        // 【修正】カメラの向きを正しく取得（反動を含まない水平ベクトル）
        camera.getWorldDirection(front);
        front.y = 0;
        front.normalize();
        side.crossVectors(front, new THREE.Vector3(0, 1, 0));

        if (keys.w) camera.position.addScaledVector(front, moveSpeed);
        if (keys.s) camera.position.addScaledVector(front, -moveSpeed);
        if (keys.a) camera.position.addScaledVector(side, -moveSpeed);
        if (keys.d) camera.position.addScaledVector(side, moveSpeed);

        // 【修正】反動をじわじわ戻す（リカバリー）
        if (recoilOffset > 0) {
            const recovery = 0.005; // 戻るスピード
            recoilOffset -= recovery;
            camera.rotation.x -= recovery;
        }
    }

    renderer.render(scene, camera);
}

// --- 5. 射撃システム ---
function shoot() {
    // 【修正】弾道の作成（MeshBasicMaterialだと光って見えるように）
    const tracerGeo = new THREE.BoxGeometry(0.02, 0.02, 20); // 少し太く長く
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // 黄色が見えやすい
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    // 【修正】弾道の位置と回転をカメラに同期
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    tracer.position.copy(camera.position);
    // 弾道を少し下にずらす（銃の銃口位置に合わせるための予備）
    tracer.position.y -= 0.1; 
    
    // カメラの回転をコピー
    tracer.quaternion.copy(camera.quaternion);
    // 弾道の中心を前方にずらす
    tracer.translateZ(-10); 

    scene.add(tracer);

    // 【修正】反動の蓄積
    const punch = 0.02;
    camera.rotation.x += punch;
    recoilOffset += punch;

    setTimeout(() => {
        scene.remove(tracer);
        tracerGeo.dispose();
        tracerMat.dispose();
    }, 40);
}

document.addEventListener('mousedown', (e) => {
    if (controls.isLocked && e.button === 0) shoot();
});

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
