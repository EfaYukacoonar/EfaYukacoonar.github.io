<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Three.js FPS Shooter</title>
    <style>
        body { margin: 0; overflow: hidden; background: #000; }
        #crosshair {
            position: absolute; top: 50%; left: 50%;
            width: 10px; height: 10px;
            border: 2px solid lime; border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div id="crosshair"></div>
    
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
                "three/examples/jsm/controls/PointerLockControls": "https://unpkg.com/three@0.160.0/examples/jsm/controls/PointerLockControls.js"
            }
        }
    </script>

    <script type="module">
        import * as THREE from 'three';
        import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

        // --- 1. 基本セットアップ ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x050505);

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
            speed: 0.15,
            basePitch: 0 // リコイル回復用の基準点
        };

        const controls = new PointerLockControls(camera, document.body);
        scene.add(controls.getObject());
        
        // クリックで開始
        document.body.addEventListener('click', () => {
            if (!isMenuOpen) controls.lock();
        });

        // --- 3. メニューシステム ---
        const menuOverlay = document.createElement('div');
        menuOverlay.style = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); background:rgba(0,0,0,0.8); color:white; padding:20px; display:none; flex-direction:column; gap:10px; text-align:center; font-family:sans-serif; border:2px solid red; z-index:100;";
        menuOverlay.innerHTML = `
            <h2>MODOKI MENU</h2>
            <label>Bot Strength: <select id="botLevel"><option>Radiant</option><option>Diamond</option><option>Bronze</option></select></label>
            <label>Cheat Mode: <input type="checkbox" id="cheatOn"> ON</label>
            <button id="closeBtn">CLOSE (ENTER)</button>
        `;
        document.body.appendChild(menuOverlay);

        let isMenuOpen = false;
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

        document.addEventListener('keydown', (e) => { if (e.code === 'Enter') toggleMenu(); });
        document.getElementById('closeBtn').onclick = toggleMenu;

        // --- 4. 操作入力 ---
        const keys = { w: false, a: false, s: false, d: false };
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (key in keys) keys[key] = true;
            if (e.code === 'Space' && player.canJump) { player.velocity.y += 0.2; player.canJump = false; }
            if (e.code === 'ShiftLeft') { player.isCrouching = true; }
        });
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (key in keys) keys[key] = false;
            if (e.code === 'ShiftLeft') { player.isCrouching = false; }
        });

        // --- 5. 射撃システム ---
        let shotCount = 0;
        let lastShotTime = 0;

        function shoot() {
            const now = Date.now();
            if (now - lastShotTime > 300) shotCount = 0;
            lastShotTime = now;
            shotCount++;

            // 拡散(Spread)の計算
            let spread = Math.min(shotCount * 0.01, 0.1);
            if (!player.canJump) spread += 0.1;
            else if (keys.w || keys.a || keys.s || keys.d) spread += 0.03;
            if (player.isCrouching) spread *= 0.5;

            // 弾道の作成
            const tracerGeo = new THREE.BoxGeometry(0.02, 0.02, 20); // Cylinderより軽量
            const tracerMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const tracer = new THREE.Mesh(tracerGeo, tracerMat);

            // カメラの向きを取得
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);

            // 拡散を適用
            direction.x += (Math.random() - 0.5) * spread;
            direction.y += (Math.random() - 0.5) * spread;
            direction.normalize();

            // 弾道の位置と回転を設定
            tracer.position.copy(camera.position).addScaledVector(direction, 10);
            tracer.lookAt(camera.position.clone().addScaledVector(direction, 20));
            
            scene.add(tracer);
            setTimeout(() => { scene.remove(tracer); }, 40);

            // リコイル (カメラを上に跳ね上げる)
            camera.rotation.x += 0.02 + (shotCount * 0.005);
        }

        window.addEventListener('mousedown', () => { if (controls.isLocked) shoot(); });

        // --- 6. 更新ループ ---
        function animate() {
            requestAnimationFrame(animate);

            if (controls.isLocked) {
                const currentSpeed = player.isCrouching ? 0.07 : 0.15;
                if (keys.w) controls.moveForward(currentSpeed);
                if (keys.s) controls.moveForward(-currentSpeed);
                if (keys.a) controls.moveRight(-currentSpeed);
                if (keys.d) controls.moveRight(currentSpeed);

                // 重力
                player.velocity.y -= 0.01;
                const obj = controls.getObject();
                obj.position.y += player.velocity.y;

                const targetH = player.isCrouching ? player.crouchHeight : player.height;
                if (obj.position.y < targetH) {
                    obj.position.y = targetH;
                    player.velocity.y = 0;
                    player.canJump = true;
                }

                // リコイルの自然回復 (少しずつ下に戻す)
                if (Date.now() - lastShotTime > 150) {
                    // ここでは簡易的に0（水平）に向かって戻す処理
                    if (camera.rotation.x > 0) {
                        camera.rotation.x -= 0.005;
                    }
                }
            }

            renderer.render(scene, camera);
        }

        // 環境
        scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const grid = new THREE.GridHelper(200, 50, 0xff0000, 0x444444);
        scene.add(grid);

        // リサイズ対応
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        animate();
    </script>
</body>
</html>
