import * as THREE from 'three';

export class Tower extends THREE.Group {
    constructor(x, z, theme) {
        super();
        this.position.set(x, 0, z);
        
        // Polished Chrome Base
        const baseGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.25, 32);
        const baseMat = new THREE.MeshStandardMaterial({ 
            color: 0x222222, metalness: 1.0, roughness: 0.1, envMapIntensity: 1 
        });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.castShadow = true;
        base.receiveShadow = true;
        this.add(base);

        // Neon-Glow Head
        const headGeo = theme.tower === "Mixer" 
            ? new THREE.TorusKnotGeometry(0.2, 0.07, 128, 16) 
            : new THREE.OctahedronGeometry(0.3);
            
        const headMat = new THREE.MeshStandardMaterial({ 
            color: parseInt(theme.primary), 
            emissive: parseInt(theme.primary),
            emissiveIntensity: 0.5,
            metalness: 0.8,
            roughness: 0.2
        });
        
        const head = new THREE.Mesh(headGeo, headMat);
        head.position.y = 0.7;
        head.castShadow = true;
        this.add(head);
    }
}
