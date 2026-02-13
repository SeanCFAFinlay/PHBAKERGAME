import * as THREE from 'three';

export class Healthbar {
  public group = new THREE.Group();
  private fill: THREE.Mesh;

  constructor(width = 1.2, height = 0.12) {
    const bg = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: 0x220000, transparent: true, opacity: 0.9 })
    );

    this.fill = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.95 })
    );

    this.fill.position.z = 0.001;
    this.group.add(bg);
    this.group.add(this.fill);
  }

  setPercent(p: number) {
    const clamped = Math.max(0, Math.min(1, p));
    this.fill.scale.x = clamped;
    this.fill.position.x = -(1 - clamped) * 0.6; // left anchored for width=1.2
  }
}
