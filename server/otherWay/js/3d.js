import { id as MainId } from "/js/join.js";
import * as THREE from "./three.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

function animate() {
    requestAnimationFrame(animate);

    if(MainId && scene.getObjectByName("car-" + MainId)) {
        const r = 20;
        const p = scene.getObjectByName("car-" + MainId).position
        camera.position.x = p.y;
        camera.position.y = p.x;
        camera.position.z = r;
    }
    renderer.render(scene, camera);
}

function initScene() {
    const geo = new THREE.PlaneGeometry(2000, 2000);
    const mat = new THREE.MeshBasicMaterial({ color: 0x486F38, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geo, mat);
    scene.add(plane);
    console.log(plane);

    const carG = new THREE.BoxGeometry(1, 1, 1);
    const carM = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    for (let i = 0; i <= 100; i += 2) {
        let car = new THREE.Mesh(
            carG, carM
        );
        car.position.y = i;
        car.position.x = i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.y = -i;
        car.position.x = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.y = i;
        car.position.x = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.y = -i;
        car.position.x = i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.y = 0;
        car.position.x = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.y = 0;
        car.position.x = i;

        scene.add(car);
        car = new THREE.Mesh(
            carG, carM
        );
        car.position.x = 0;
        car.position.y = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.x = 0;
        car.position.y = i;
        scene.add(car);
    }
}

export function graphicsInit() {
    document.body.appendChild(renderer.domElement);
    initScene();
    animate();
}

export function addCar(id, color) {
    const threeColor = new THREE.Color();
    threeColor.setStyle(color);

    const car = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: threeColor }),
    );
    car.name = "car-" + id;

    scene.add(car);
}

export function delCar(id) {
    scene.remove(scene.getObjectByName("car-" + id));
}

export function clearSceen() {
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    initScene();
}

export function updateCar(id, x, y, angle) {
    const carObj = scene.getObjectByName("car-" + id);
    carObj.userData.ang = angle;
    carObj.position.set(x, y, 0);
    console.log(carObj.position, carObj.userData)
}
