import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// --- 1. 基本セットアップ ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); // 少し暗くして弾道を見やすく

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 2. プレイヤー変数 ---
const player = {
    height: 1.6,
    crouchHeight: 0.8,
    isCrouching: false,
    canJump: false,
    velocity: new THREE.Vector3(),
    speed: 0.15
};

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

// --- 3. メニューシステム (Enterで表示) ---
const menuOverlay = document.createElement('div');
menuOverlay.style = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.8); color:white; padding:20px; display:none; flex-direction:column; gap:10px; text-align:center; font-family:sans-serif; border:2px solid red;";
menuOverlay.innerHTML = `
    <h2>MODOKI MENU</h2>
    <label>Bot Strength: <select id="botLevel"><option>Radiant (Instant Headshot)</option><option>Diamond</option><option>Bronze</option></select></label>
    <label>Cheat Mode: <input type="checkbox" id="cheatOn"> ON</label>
    <button onclick="document.dispatchEvent(new Event('closeMenu'))">CLOSE (ENTER)</button>
`;
document.body.appendChild(menuOverlay);

let isMenuOpen = false;
document.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        isMenuOpen = !isMenuOpen;
        if (isMenuOpen) {
            controls.unlock();
            menuOverlay.style.display = 'flex';
        } else {
            menuOverlay.style.display = 'none';
            controls.lock();
        }
    }
});
document.addEventListener('closeMenu', () => { isMenuOpen = false; menuOverlay.style.display = 'none'; controls.lock(); });

// --- 4. 操作入力 (左Shiftでしゃがみ) ---
const keys = { w: false, a: false, s: false, d: false };
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
    if (e.code === 'Space' && player.canJump) { player.velocity.y += 0.15; player.canJump = false; }
    if (e.code === 'ShiftLeft') { player.isCrouching = true; player.speed = 0.07; }
});
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
    if (e.code === 'ShiftLeft') { player.isCrouching = false; player.speed = 0.15; }
});

// --- 5. 強化版リコイル & 射撃システム ---
let shotCount = 0;
let lastShotTime = 0;
let currentSpread = 0;

function shoot() {
    const now = Date.now();
    if (now - lastShotTime > 300) shotCount = 0; // 0.3秒以上空けたらリセット
    lastShotTime = now;
    shotCount++;

    // 弾道の作成 (太く、明るく)
    const tracerGeo = new THREE.CylinderGeometry(0.02, 0.02, 20);
    const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const tracer = new THREE.Mesh(tracerGeo, tracerMat);

    // 拡散の計算 (Valorant風)
    let spread = Math.min(shotCount * 0.02, 0.15); // 撃ち続けると増える
    if (!player.canJump) spread += 0.2; // ジャンプ中は最悪
    else if (keys.w || keys.a || keys.s || keys.d) spread += 0.05; // 移動中
    if (player.isCrouching) spread *= 0.5; // しゃがみは神精度

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.x += (Math.random() - 0.5) * spread;
    direction.y += (Math.random() - 0.5) * spread;
    direction.normalize();

    // 弾道の配置
    tracer.position.copy(camera.position);
    tracer.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    tracer.translateY(-10); // 自分の位置から前方に配置
    scene.add(tracer);
    setTimeout(() => { scene.remove(tracer); }, 50);

    // リコイル：視点を「上に」跳ね上げる (+=)
    const upRecoil = shotCount < 5 ? 0.03 : 0.01;
    camera.rotation.x += upRecoil; 
}

window.addEventListener('mousedown', () => { if (controls.isLocked) shoot(); });

// --- 6. アニメーション & リコイル回復 ---
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked) {
        // 移動
        if (keys.w) controls.moveForward(player.speed);
        if (keys.s) controls.moveForward(-player.speed);
        if (keys.a) controls.moveRight(-player.speed);
        if (keys.d) controls.moveRight(player.speed);

        // 重力と高さ
        player.velocity.y -= 0.008;
        controls.getObject().position.y += player.velocity.y;
        const targetH = player.isCrouching ? player.crouchHeight : player.height;
        if (controls.getObject().position.y < targetH) {
            controls.getObject().position.y = targetH;
            player.velocity.y = 0;
            player.canJump = true;
        }

        // リコイル・拡散の自然回復
        if (Date.now() - lastShotTime > 100) {
            // 視点をゆっくり下げる
            if (camera.rotation.x > -Math.PI / 2) {
                camera.rotation.x -= 0.005; // ここで自然に下を向く（回復）
                // 元の高さより下がりすぎないように調整が必要な場合はここに。
            }
        }
    }
    renderer.render(scene, camera);
}

// マップ作りと実行
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
scene.add(new THREE.GridHelper(100, 100));
animate();
