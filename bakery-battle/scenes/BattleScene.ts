import * as THREE from 'three';
import { Tower } from '../entities/Tower';

export class BattleScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c12); // --bg from source

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 16, 14); // Exact overhead perspective
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.initGraphics();
    this.animate();
  }

  private initGraphics() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(5, 10, 7.5);
    this.scene.add(sun);

    // The signature "Baking Sheet" Grass Grid
    const grid = new THREE.GridHelper(16, 16, 0x22c55e, 0x22314a);
    this.scene.add(grid);
  }

  // Implementation of the signature purple lightning bolt
  public createLightning(x1: number, z1: number, x2: number, z2: number) {
    const dx = x2 - x1, dz = z2 - z1;
    const len = Math.sqrt(dx * dx + dz * dz);
    const geo = new THREE.CylinderGeometry(0.04, 0.04, len, 6);
    geo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xa855f7 }));
    mesh.position.set((x1 + x2) / 2, 0.5, (z1 + z2) / 2);
    mesh.lookAt(x2, 0.5, z2);
    this.scene.add(mesh);
    setTimeout(() => this.scene.remove(mesh), 100);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };
}
