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
let recoilRecovery = 0; // 戻るべき回転量

function shoot() {
    // 1. 弾道の作成
    const tracerGeo = new THREE.BoxGeometry(0.01, 0.01, 20); // 少し長めに
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    // 2. カメラの「現在」の向きを完全にコピー
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    // 弾道の位置をカメラ位置に
    tracer.position.copy(camera.position);
    // 弾道をカメラの向きに回転させる
    tracer.lookAt(camera.position.clone().add(direction));
    // 弾道を自分の少し前方へ配置（めり込み防止）
    tracer.translateZ(-10); 

    scene.add(tracer);

    // 3. 反動（リコイル）
    // 瞬発的に上に向ける
    const recoilForce = 0.03;
    camera.rotation.x += recoilForce;
    recoilRecovery += recoilForce; // 後で戻すために蓄積

    // 4. 0.03秒後に弾道を消す（もっと短くすると「光」っぽくなる）
    setTimeout(() => { scene.remove(tracer); }, 30);
}

// 毎フレームの更新処理（animate関数の中で使う）
function updateRecoil() {
    if (recoilRecovery > 0) {
        const recoverSpeed = 0.005; // 戻る速さ
        camera.rotation.x -= recoverSpeed;
        recoilRecovery -= recoverSpeed;
        
        if (recoilRecovery < 0) {
            camera.rotation.x -= recoilRecovery; // 行き過ぎを補正
            recoilRecovery = 0;
        }
    }
}

// --- 【重要】animate関数の中身を書き換え ---
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        // ... (移動の計算はそのまま) ...
        
        // 追加：反動をゆっくり戻す
        updateRecoil();
    }

    renderer.render(scene, camera);
}

animate();

// リサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
