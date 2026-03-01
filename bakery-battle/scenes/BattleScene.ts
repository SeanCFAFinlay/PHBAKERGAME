import * as THREE from 'three';
import { Tower } from '../entities/Tower';

interface Particle {
    mesh: THREE.Mesh;
    vx: number; vy: number; vz: number;
    life: number;
}

export class BattleScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private particles: Particle[] = [];
    private clock = new THREE.Clock();

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0c12);
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 16, 14);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.initGraphics();
        this.animate();
    }

    private initGraphics() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const grid = new THREE.GridHelper(16, 16, 0x22c55e, 0x22314a);
        this.scene.add(grid);
    }

    // THE SPRINKLE EXPLOSION: Creates 10-15 colorful cubes
    public spawnSprinkles(x: number, z: number, color: number = 0xffffff) {
        const sprinkleGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        for (let i = 0; i < 12; i++) {
            const mesh = new THREE.Mesh(sprinkleGeo, new THREE.MeshStandardMaterial({ color }));
            mesh.position.set(x, 0.5, z);
            this.scene.add(mesh);
            this.particles.push({
                mesh,
                vx: (Math.random() - 0.5) * 10,
                vy: Math.random() * 10,
                vz: (Math.random() - 0.5) * 10,
                life: 1.0
            });
        }
    }

    private updateParticles(dt: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.vx *= 0.95; p.vz *= 0.95; // Drag
            p.vy -= 20 * dt;            // Gravity
            p.mesh.position.x += p.vx * dt;
            p.mesh.position.y += p.vy * dt;
            p.mesh.position.z += p.vz * dt;
            p.life -= dt;
            p.mesh.scale.setScalar(p.life);
            if (p.life <= 0 || p.mesh.position.y < 0) {
                this.scene.remove(p.mesh);
                this.particles.splice(i, 1);
            }
        }
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        const dt = this.clock.getDelta();
        this.updateParticles(dt);
        this.renderer.render(this.scene, this.camera);
    }
}
