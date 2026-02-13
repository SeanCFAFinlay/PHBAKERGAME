import * as THREE from "three";
import { GAMEPLAY_CAMERA } from "@phbakergame/shared/camera";
import { createRenderer } from "./runtime/createRenderer";
import { loadConfigs } from "./runtime/loadConfigs";
import { AssetSpawner } from "./runtime/AssetSpawner";
import { startLoop } from "./runtime/updateLoop";

async function main() {
  const renderer = createRenderer();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0b0b);

  const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.9);
  scene.add(hemi);

  const camera = new THREE.PerspectiveCamera(
    GAMEPLAY_CAMERA.fov,
    window.innerWidth / window.innerHeight,
    GAMEPLAY_CAMERA.near,
    GAMEPLAY_CAMERA.far
  );
  camera.position.set(...GAMEPLAY_CAMERA.position);
  camera.lookAt(new THREE.Vector3(...GAMEPLAY_CAMERA.lookAt));

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const { manifest, overrides } = await loadConfigs();
  const spawner = new AssetSpawner(scene, manifest, overrides);

  const e1 = await spawner.spawn("enemy_basic", "enemy", new THREE.Vector3(-2, 0, 0));
  await spawner.spawn("tower_basic", "tower", new THREE.Vector3(2, 0, 0));

  let hp = 1;
  setInterval(() => {
    hp -= 0.07;
    if (hp < 0) hp = 1;
    spawner.setHealth(e1, hp * 100, 100);
  }, 250);

  startLoop({
    renderer,
    scene,
    camera,
    getBillboardTargets: () => {
      const targets: { obj: THREE.Object3D; yAxisOnly: boolean }[] = [];
      for (const s of spawner.getAll()) {
        if (s.billboard) targets.push({ obj: s.visual, yAxisOnly: s.yAxisOnly });
        if (s.iconBadge) targets.push({ obj: s.iconBadge, yAxisOnly: true });
        if (s.healthbar) targets.push({ obj: s.healthbar.group, yAxisOnly: true });
      }
      return targets;
    }
  });
}

main().catch((e) => console.error(e));
