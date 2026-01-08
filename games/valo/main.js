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

// --
• 2. 地面と箱（高低差）を作る ---
const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 1); // 全体を明るくする光
scene.add(light);

const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 練習用の段差
const boxGeometry = new THREE.BoxGeometry(2, 1, 2);
const boxMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 0.5, -5);
scene.add(box);

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
