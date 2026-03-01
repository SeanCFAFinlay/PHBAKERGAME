import * as THREE from 'three';
export class Tower extends THREE.Group {
  constructor(x: number, z: number, type: 'bakery' | 'dentist') {
    super();
    this.position.set(x, 0, z);
    
    // Socket Base (Standard across themes)
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.45, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a2639 })
    );
    this.add(base);

    if (type === 'bakery') {
      // THE MIXER: Torus Knot geometry for the paddle
      const head = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.18, 0.06, 64, 8),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9, roughness: 0.1 })
      );
      head.position.y = 0.6;
      this.add(head);
    } else {
      // THE DRILL: Sharp Cone geometry
      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x00d4ff, metalness: 1.0, roughness: 0.1 })
      );
      head.position.y = 0.5;
      this.add(head);
    }
  }
}
