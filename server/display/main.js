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

const cubes = [];

camera.position.z = 5;

initSocket((msg) => {
  const { type, id, data } = JSON.parse(msg);
  if (type === "cfg") {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, [
      new THREE.MeshBasicMaterial({ color: data.color }),
      new THREE.MeshBasicMaterial({ color: data.color }),
      new THREE.MeshBasicMaterial({ color: data.color }),
      new THREE.MeshBasicMaterial({ color: data.color }),
      new THREE.MeshBasicMaterial({ color: data.color }),
      new THREE.MeshBasicMaterial({ color: data.color }),
    ]);
    cubes[id] = cube;
    scene.add(cube);
  } else if (type === "act") {
    const cube = cubes[id];
    const [rotation, acceleration] = data;

    cube.rotation.z = rotation * 0.01;
    cube.position.z -= acceleration * 0.1;
  } else if (type === "cls") {
    const cube = cubes[id];
    scene.remove(cube);

    delete cubes[id];
  }
});

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
