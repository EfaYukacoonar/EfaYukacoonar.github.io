import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// --- 1. 基本セットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x72729e);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 1.6;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. 変数宣言 ---
let isMenuOpen = false; // エラー回避のために上に持ってきたよ
let shotCount = 0;
let lastShotTime = 0;
const keys = { w: false, a: false, s: false, d: false };

const player = {
    height: 1.6,
    crouchHeight: 0.8,
    isCrouching: false,
    canJump: false,
    velocity: new THREE.Vector3(),
    speed: 0.15
};

// --- 3. メニューシステムの実装 ---
const menuOverlay = document.createElement('div');
menuOverlay.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.8); color:white; padding:20px; display:none; flex-direction:column; gap:10px; text-align:center; font-family:sans-serif; border:2px solid red; z-index:100;";
menuOverlay.innerHTML = `
    <h2>MODOKI MENU</h2>
    <label>Bot Strength: <select id="botLevel"><option>Radiant</option><option>Diamond</option><option>Bronze</option></select></label>
    <label>Cheat Mode: <input type="checkbox" id="cheatOn"> ON</label>
    <button id="closeBtn">CLOSE (ENTER)</button>
`;
document.body.appendChild(menuOverlay);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        controls.unlock();
        menuOverlay.style.display = 'flex';
    } else {
        menuOverlay.style.display = 'none';
        controls.lock();
    }
};

// ボタンとキーのイベント登録
document.getElementById('closeBtn').onclick = toggleMenu;
document.addEventListener('keydown', (e) => { 
    if (e.code === 'Enter') toggleMenu(); 
});

// クリックで開始（メニューが開いてない時だけロック）
document.body.addEventListener('click', () => {
    if (!isMenuOpen) controls.lock();
});

// --- 4. 操作入力 ---
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
    if (e.code === 'Space' && player.canJump) { 
        player.velocity.y += 0.2; 
        player.canJump = false; 
    }
    if (e.code === 'ShiftLeft') player.isCrouching = true;
});
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
    if (e.code === 'ShiftLeft') player.isCrouching = false;
});

// --- 5. 射撃システム ---
function shoot() {
    const now = Date.now();
    if (now - lastShotTime > 300) shotCount = 0;
    lastShotTime = now;
    shotCount++;

    let spread = Math.min(shotCount * 0.01, 0.1);
    if (!player.canJump) spread += 0.1;
    else if (keys.w || keys.a || keys.s || keys.d) spread += 0.03;
    if (player.isCrouching) spread *= 0.5;

    const tracerGeo = new THREE.BoxGeometry(0.02, 0.02, 20);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    tracer.position.copy(camera.position).addScaledVector(direction, 10);
    tracer.lookAt(camera.position.clone().addScaledVector(direction, 20));
    
    scene.add(tracer);
    setTimeout(() => { scene.remove(tracer); }, 40);

    camera.rotation.x += 0.02 + (shotCount * 0.005);
}

window.addEventListener('mousedown', () => { 
    if (controls.isLocked) shoot(); 
});

// --- 6. 更新ループ ---
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        const currentSpeed = player.isCrouching ? 0.07 : 0.15;
        if (keys.w) controls.moveForward(currentSpeed);
        if (keys.s) controls.moveForward(-currentSpeed);
        if (keys.a) controls.moveRight(-currentSpeed);
        if (keys.d) controls.moveRight(currentSpeed);

        player.velocity.y -= 0.01;
        const obj = controls.getObject();
        obj.position.y += player.velocity.y;

        const targetH = player.isCrouching ? player.crouchHeight : player.height;
        if (obj.position.y < targetH) {
            obj.position.y = targetH;
            player.velocity.y = 0;
            player.canJump = true;
        }

        if (Date.now() - lastShotTime > 150) {
            if (camera.rotation.x > 0) camera.rotation.x -= 0.005;
        }
    }
    renderer.render(scene, camera);
}

// 環境とリサイズ設定
scene.add(new THREE.AmbientLight(0xffffff, 0.8));
const grid = new THREE.GridHelper(200, 50, 0xff0000, 0x444444);
scene.add(grid);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
