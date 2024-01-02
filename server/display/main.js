import * as THREE from "three";
import initSocket from "sockets";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cars = [];

let tracking = null;
window.track = (carId) => {
  if (tracking === carId) {
    tracking = null;
  } else {
    tracking = carId;
    console.log("tracking ", carId)

    // TODO: move camera to car
  }
};

camera.position.z = 5;

initSocket((msg) => {
  const { type, id, data } = JSON.parse(msg);
  if (type === "cfg") {
    const car = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial({ color: data.color }),
    );
    cars[id] = car;
    scene.add(car);
  } else if (type === "act") {
    const car = cars[id];
    const [rotation, acceleration] = data;

    if (tracking === id) {
      const oldObjectPosition = new THREE.Vector3();
      car.getWorldPosition(oldObjectPosition);

      car.rotation.z = rotation * 0.01;
      car.position.z -= acceleration * 0.1;

      const newObjectPosition = new THREE.Vector3();
      car.getWorldPosition(newObjectPosition);

      const delta = newObjectPosition.clone().sub(oldObjectPosition);
      camera.position.add(delta);
    } else {
      car.rotation.z = rotation * 0.01;
      car.position.z -= acceleration * 0.1;
    }
  } else if (type === "cls") {
    const car = cars[id];
    scene.remove(car);

    delete cars[id];
  }
});

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
