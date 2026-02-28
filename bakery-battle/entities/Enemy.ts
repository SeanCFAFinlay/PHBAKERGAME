import * as THREE from 'three';

export class Enemy extends THREE.Group {
  public hp: number = 100;
  constructor(x: number, z: number) {
    super();
    this.position.set(x, 0.25, z);
    const geo = new THREE.SphereGeometry(0.25, 16, 16);
    const mat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x330000 });
    const mesh = new THREE.Mesh(geo, mat);
    this.add(mesh);
  }
}
