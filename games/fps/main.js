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
