import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// --
• 1. 世界の基本セットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // 空の色

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6; // プレイヤーの目の高さ

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. 【ここから入れ替え！】 ---
const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1);
scene.add(light);

// 地面の代わりにグリッドを表示
const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// 20個のランダムな箱を作る
for (let i = 0; i < 20; i++) {
    const size = Math.random() * 2 + 1;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const material = new THREE.MeshPhongMaterial({ 
        color: Math.random() * 0xffffff 
    });
    const testBox = new THREE.Mesh(geometry, material);
    
    testBox.position.x = (Math.random() - 0.5) * 40;
    testBox.position.z = (Math.random() - 0.5) * 40;
    testBox.position.y = size / 2;
    
    scene.add(testBox);
}


// --
• 3. FPS操作の設定 ---
const controls = new PointerLockControls(camera, document.body);

// 画面クリックでゲーム開始
document.addEventListener('click', () => {
    controls.lock();
});

// 画面サイズが変わった時の対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --
• 4. 描画ループ（ここが心臓部） ---
function animate() {
    requestAnimationFrame(animate);
    // ここにあとで移動の処理とかを書くよ！
    renderer.render(scene, camera);
}

animate();
