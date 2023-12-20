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

const geometry = new THREE.BoxGeometry(1, 1, 1);
const cube = new THREE.Mesh(geometry, [
  new THREE.MeshBasicMaterial({ color: 0xdd0000 }),
  new THREE.MeshBasicMaterial({ color: 0xdd0000 }),
  new THREE.MeshBasicMaterial({ color: 0x00dd00 }),
  new THREE.MeshBasicMaterial({ color: 0x00dd00 }),
  new THREE.MeshBasicMaterial({ color: 0x0000dd }),
  new THREE.MeshBasicMaterial({ color: 0x0000dd }),
]);
scene.add(cube);

camera.position.z = 5;

initSocket((msg) => {
  const [rotation, acceleration] = JSON.parse(msg);

  cube.rotation.z = rotation * 0.01;
  cube.position.z -= acceleration * 0.1;
});

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

animate();
