import * as THREE from 'three';
import Stats from 'stats.js';

export interface RendererConfig {
  container: HTMLElement;
  enableShadows?: boolean;
  enableStats?: boolean;
}

export class GameRenderer {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private stats?: Stats;
  private animationFrameId?: number;
  private updateCallbacks: Array<(delta: number) => void> = [];
  private clock: THREE.Clock;

  constructor(config: RendererConfig) {
    this.clock = new THREE.Clock();

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c12);
    this.scene.fog = new THREE.Fog(0x0a0c12, 20, 60);

    // Setup camera - standard tower defense view
    this.camera = new THREE.PerspectiveCamera(
      50, // FOV
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 12, 15);
    this.camera.lookAt(0, 0, 0);

    // Setup renderer with correct color space and tone mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Critical rendering settings per requirements
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    if (config.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    config.container.appendChild(this.renderer.domElement);

    // Setup stats overlay if enabled
    if (config.enableStats) {
      this.stats = new Stats();
      this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb
      this.stats.dom.style.position = 'absolute';
      this.stats.dom.style.top = '0';
      this.stats.dom.style.left = '0';
      config.container.appendChild(this.stats.dom);
    }

    // Setup lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;

    // Shadow settings
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;

    this.scene.add(directionalLight);
  }

  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public addUpdateCallback(callback: (delta: number) => void): void {
    this.updateCallbacks.push(callback);
  }

  public removeUpdateCallback(callback: (delta: number) => void): void {
    const index = this.updateCallbacks.indexOf(callback);
    if (index !== -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  public start(): void {
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);

      if (this.stats) {
        this.stats.begin();
      }

      const delta = this.clock.getDelta();

      // Call all update callbacks
      this.updateCallbacks.forEach((callback) => callback(delta));

      this.renderer.render(this.scene, this.camera);

      if (this.stats) {
        this.stats.end();
      }
    };

    animate();
  }

  public stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  public dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.handleResize.bind(this));
    this.renderer.dispose();
    if (this.stats) {
      this.stats.dom.remove();
    }
  }
}
