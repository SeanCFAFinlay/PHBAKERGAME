import * as THREE from 'three';
import { Tower } from '../combat/TowerEntity';

export class BattleScene {
    private scene = new THREE.Scene();
    private camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
    private renderer: THREE.WebGLRenderer;
    private clock = new THREE.Clock();
    private particles: any[] = [];

    constructor(canvas: HTMLCanvasElement, theme: any) {
        this.scene.background = new THREE.Color(0x0a0c12);
        this.camera.position.set(0, 16, 14);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.init(theme);
        this.animate();
    }

    private init(theme: any) {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6), new THREE.GridHelper(16, 16, parseInt(theme.grid), 0x22314a));
        this.scene.add(new Tower(2, 2, theme));
    }

    public spawnParticles(pos: THREE.Vector3, color: number) {
        for (let i=0; i<8; i++) {
            const m = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshStandardMaterial({color}));
            m.position.copy(pos);
            this.scene.add(m);
            this.particles.push({ m, vx:(Math.random()-0.5)*5, vy:Math.random()*5, vz:(Math.random()-0.5)*5, life:1 });
        }
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        const dt = this.clock.getDelta();
        this.particles.forEach((p, i) => {
            p.vy -= 15 * dt; p.m.position.x += p.vx*dt; p.m.position.y += p.vy*dt; p.m.position.z += p.vz*dt;
            p.life -= dt; p.m.scale.setScalar(p.life);
            if (p.life <= 0) { this.scene.remove(p.m); this.particles.splice(i, 1); }
        });
        this.renderer.render(this.scene, this.camera);
    }
}
