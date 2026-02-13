import * as THREE from 'three';
import { applyBillboard } from '../render/Billboard';

export function startLoop(opts: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  getBillboardTargets: () => { obj: THREE.Object3D; yAxisOnly: boolean }[];
}) {
  const { renderer, scene, camera } = opts;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();

  function tick() {
    clock.getDelta();
    for (const t of opts.getBillboardTargets()) applyBillboard(t.obj, camera, t.yAxisOnly);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}
