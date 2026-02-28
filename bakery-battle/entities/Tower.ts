import * as THREE from 'three';

export class Tower extends THREE.Group {
  constructor(x: number, z: number, type: 'bakery' | 'dentist') {
    super();
    this.position.set(x, 0, z);

    // Base: Stylized "Puzzle Pen" socket
    const baseGeo = new THREE.CylinderGeometry(0.4, 0.45, 0.2, 12);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a2639 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    this.add(base);

    // Head: The "Weapon" (Bakery uses Torus/Mixer, Dentist uses Cone/Drill)
    const headMat = new THREE.MeshStandardMaterial({ 
      color: type === 'bakery' ? 0xffd700 : 0x00d4ff, 
      metalness: 0.8, 
      roughness: 0.2 
    });

    const headGeo = type === 'bakery' 
      ? new THREE.TorusKnotGeometry(0.18, 0.06, 64, 8) 
      : new THREE.ConeGeometry(0.2, 0.5, 4);

    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.5;
    this.add(head);
  }
}
