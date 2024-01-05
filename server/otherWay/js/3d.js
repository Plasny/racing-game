import { id as MainId } from "/js/join.js";
import * as THREE from "./three.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
);
camera.position.y = 10;
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

function animate() {
    requestAnimationFrame(animate);

    if(MainId && scene.getObjectByName("car-" + MainId)) {
        const r = 20;
        const car = scene.getObjectByName("car-" + MainId)
        const p = car.position
        camera.position.x = p.x - r * Math.sin(car.userData.ang);
        camera.position.z = p.z - r * Math.cos(car.userData.ang);
        camera.position.y = r;
        camera.lookAt(p);
    }
    renderer.render(scene, camera);
}

function initScene() {
    // const axesHelper = new THREE.AxesHelper( 1000 );
    // axesHelper.setColors(0xff0000, 0x00ff00, 0x0000ff)
    // scene.add( axesHelper );

    const geo = new THREE.PlaneGeometry(2000, 2000);
    const mat = new THREE.MeshBasicMaterial({ color: 0x486F38, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotateX(0.5 * Math.PI);
    scene.add(plane);
    console.log(plane);

    const carG = new THREE.BoxGeometry(1, 1, 1);
    const carM = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    for (let i = 0; i <= 100; i += 5) {
        let car = new THREE.Mesh(
            carG, carM
        );
        car.position.z = i;
        car.position.x = i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.z = -i;
        car.position.x = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.z = i;
        car.position.x = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.z = -i;
        car.position.x = i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.z = 0;
        car.position.x = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.z = 0;
        car.position.x = i;

        scene.add(car);
        car = new THREE.Mesh(
            carG, carM
        );
        car.position.x = 0;
        car.position.z = -i;
        scene.add(car);

        car = new THREE.Mesh(
            carG, carM
        );
        car.position.x = 0;
        car.position.z = i;
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
        [
            new THREE.MeshBasicMaterial({ color: threeColor }),
            new THREE.MeshBasicMaterial({ color: threeColor }),
            new THREE.MeshBasicMaterial({ color: threeColor }),
            new THREE.MeshBasicMaterial({ color: threeColor }),
            new THREE.MeshBasicMaterial({ color: threeColor }),
            new THREE.MeshBasicMaterial({ color: 0x000000 }),
        ]
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
    carObj.userData.ang = angle * Math.PI / 180;
    carObj.position.set(y, 0, x);
    carObj.rotation.y = carObj.userData.ang;
    console.log(carObj.position, carObj.userData);
}
