import * as THREE from 'three';
import { Tower } from '../entities/Tower';
import { Enemy } from '../entities/Enemy';

export class BattleScene {
    private enemies: Enemy[] = [];
    private towers: Tower[] = [];
    private money: number = 500;

    constructor(canvas: HTMLCanvasElement) {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0c12);
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 15, 12);
        this.camera.lookAt(0,0,0);
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.init();
        this.setupInteractions(canvas);
        this.animate();
    }

    private init() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6), new THREE.GridHelper(16, 16, 0x22c55e, 0x22314a));
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(5,10,7.5);
        this.scene.add(sun);
    }

    private setupInteractions(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousedown', (event) => {
            // Logic to convert click to grid coordinates
            // Spend  and place a tower
            if (this.money >= 100) {
                const x = Math.round((event.clientX / window.innerWidth) * 16 - 8);
                const z = Math.round((event.clientY / window.innerHeight) * 16 - 8);
                const t = new Tower(x, z, "bakery");
                this.scene.add(t);
                this.money -= 100;
                document.getElementById('stat-money')!.innerText = '?? $' + this.money;
            }
        });
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
}
