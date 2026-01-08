import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// 1. 世界の基本セットアップ
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. 地面と箱を作る
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

// 3. FPS操作の設定
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => { controls.lock(); });

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 4. 描画ループ
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();