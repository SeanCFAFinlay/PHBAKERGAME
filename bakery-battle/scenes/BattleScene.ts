import * as THREE from 'three';
import { Tower } from '../entities/Tower';

export class BattleScene {
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
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
        this.setupInput(canvas);
        this.animate();
    }

    private init() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.6), new THREE.GridHelper(16, 16, 0x22c55e, 0x22314a));
        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(5,10,7.5);
        this.scene.add(sun);
    }

    private setupInput(canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousedown', (e) => {
            if (this.money < 100) return;
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersection = new THREE.Vector3();
            if (this.raycaster.ray.intersectPlane(plane, intersection)) {
                const tx = Math.round(intersection.x);
                const tz = Math.round(intersection.z);
                this.scene.add(new Tower(tx, tz, "bakery"));
                this.money -= 100;
                document.getElementById('stat-money')!.innerText = '?? $' + this.money;
            }
        });
    }

    private animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }
}
