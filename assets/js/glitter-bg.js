import * as THREE from 'three';

console.log("グリッターJSがロードされました！"); // これがコンソールに出るか確認してください

const canvas = document.getElementById('glitter-canvas');
if (!canvas) {
    console.error("canvasが見つかりません！");
} else {
    console.log("canvas発見！描画を開始します。");
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 5;

    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffd700 }); 
    const count = 1000;
    const mesh = new THREE.InstancedMesh(geometry, material, count);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
        dummy.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
    }
    scene.add(mesh);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
}
