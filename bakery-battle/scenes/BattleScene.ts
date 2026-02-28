import * as THREE from 'three';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';

export class BattleScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private enemies: Enemy[] = [];
    private clock: THREE.Clock = new THREE.Clock();

    // Path coordinates from your v2.html logic
    private pathPoints = [
        new THREE.Vector3(-8, 0.25, 0),
        new THREE.Vector3(0, 0.25, 0),
        new THREE.Vector3(0, 0.25, 5),
        new THREE.Vector3(8, 0.25, 5)
    ];

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x070b10);
        
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 12);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        this.initWorld();
        this.animate();
    }

    private initWorld() {
        this.scene.add(new THREE.GridHelper(20, 20, 0x55d6ff, 0x22314a));
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(5, 10, 7.5);
        this.scene.add(sun);

        // Spawn a test enemy
        const enemy = new Enemy(-8, 0);
        this.enemies.push(enemy);
        this.scene.add(enemy);
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        const delta = this.clock.getDelta();

        // Move Enemies along the path
        this.enemies.forEach(enemy => {
            // Simple forward movement for now
            enemy.position.x += 2 * delta; 
        });

        this.renderer.render(this.scene, this.camera);
    };
}
