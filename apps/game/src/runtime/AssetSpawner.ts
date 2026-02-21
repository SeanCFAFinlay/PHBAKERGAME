import * as THREE from 'three';

export function createEnemy(scene: THREE.Scene, textureUrl: string) {
  const texture = new THREE.TextureLoader().load(textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });

  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.2, 1.2, 1);
  sprite.position.y = 1;

  // Healthbar (red)
  const healthGeo = new THREE.PlaneGeometry(1, 0.15);
  const healthMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const healthBar = new THREE.Mesh(healthGeo, healthMat);
  healthBar.position.set(0, 1.2, 0);
  sprite.add(healthBar);

  scene.add(sprite);
  return sprite;
}

export function createTower(scene: THREE.Scene, iconUrl: string) {
  const baseGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x222266 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.5;

  const texture = new THREE.TextureLoader().load(iconUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const badgeMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });

  const badge = new THREE.Sprite(badgeMaterial);
  badge.scale.set(1.5, 1.5, 1);
  badge.position.set(0, 2, 0);

  base.add(badge);
  scene.add(base);

  return base;
}
