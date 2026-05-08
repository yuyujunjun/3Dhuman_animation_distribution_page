

import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

export function loadPointCloud(path, canvasId) {
  const canvas = document.getElementById(canvasId);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.01, 100);
  camera.position.set(0, 0, 3);

  const controls = new OrbitControls(camera, renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  fetch(path)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const view = new DataView(buffer);
      const numPoints = view.getUint32(0, true);
      let offset = 4;

      const positions = new Float32Array(numPoints * 3);
      const colors = new Float32Array(numPoints * 3);

      for (let i = 0; i < numPoints; i++) {
        positions[i * 3 + 0] = view.getFloat32(offset, true); offset += 4;
        positions[i * 3 + 1] = view.getFloat32(offset, true); offset += 4;
        positions[i * 3 + 2] = view.getFloat32(offset, true); offset += 4;

        colors[i * 3 + 0] = view.getUint8(offset++) / 255;
        colors[i * 3 + 1] = view.getUint8(offset++) / 255;
        colors[i * 3 + 2] = view.getUint8(offset++) / 255;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({ size: 0.01, vertexColors: true });
      const points = new THREE.Points(geometry, material);
      scene.add(points);

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
    });
}
