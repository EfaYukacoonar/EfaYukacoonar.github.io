import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { Kinematics } from './kinematics.js';
import { getEnvironmentData } from './environment.js';
import { getNormalGravity } from './earth';

const scene = new THREE.scene();
scene.background = new THREE.Color(0x87ceeb);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20000);
camera.position.set(0, 1.6, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.ambientLight(0xffffff, 0.5);
scene.add(ambientLight);

const size = 10000;
const divisions = 1000;
const gridHelper = new THREE.gridHelper(size, divisions, 0x0000ff, 0x808080);
scene.add(gridHelper);

const floorGeometry = new THREE.PlaneGeometry(size, size);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22, side: THREE.DoubleSide }),
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

const lat = 35.0116;
const lon = 135.7681;
let worldContext = {
    lat: lat,
    temp: 15,
    pressure: 1013.25,
    humidity: 50,
    wind: { speed: 0, direction: 0 }
};

const gravity = getNormalGravity(lat);
getEnvironmentData(lat, lon).then(data => {
    worldContext = {
        ...worldContext, ...data, lat: lat
    };
    console.log("Environment loaded:", worldContext);
});

const controls = new PointerLockControls(camera, document.body);
document.addEventListener('click', () => controls.lock());

const activeProjectiles = [];
window.addEventListener('mousedown', (e) => {
    if (e.button === 0 && controls.isLocked) {
        const projectile = {
            position: camera.position.clone(),
            velocity: new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(715),
            isDestroyed: false,
            currentTemp: 15,
            specs: {
                physics: {mass: {boltCarrier: 0.008}},
                barrel: {specs: {dragCofficient: 0.3}, thermals: {accuracyDegradation: 0.5}},
                thermals: {accuracyDegradation: 0.05}
            },
            crossSectionArea: 0.000045
        }
    };
    const geo = new THREE.SphereGeometry(0.05);
    const mat = new THREE.MeshBasicMaterial({color: 0xfff000});
    const mesh = new THREE.Mesh(geo, mat);
    projectile.mesh = mesh;
    scene.add(mesh);
    
})