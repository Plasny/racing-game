import * as THREE from "./three.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

export function graphicsInit() {
    document.body.appendChild(renderer.domElement);
    animate();
}

export function addCar(id, color) {
    const threeColor = new THREE.Color();
    threeColor.setStyle(color);

    const car = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: threeColor }),
    );
    car.name = id;

    scene.add(car);
}

export function delCar(id) {
    scene.remove(scene.getObjectByName(id));
}
