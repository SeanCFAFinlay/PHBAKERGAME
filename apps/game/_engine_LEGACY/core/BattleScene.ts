import * as THREE from 'three';

export class BattleScene {
    private scene = new THREE.Scene();
    private camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    private renderer: THREE.WebGLRenderer;

    constructor(canvas: HTMLCanvasElement, theme: any) {
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        
        this.scene.background = new THREE.Color(0x020408);
        this.scene.fog = new THREE.FogExp2(0x020408, 0.02);

        this.setupLighting();
        this.init(theme);
    }

    private setupLighting() {
        // Soft Ambient fill
        this.scene.add(new THREE.AmbientLight(0x404040, 0.5));

        // Strong Directional "Sun" with Shadows
        const sun = new THREE.DirectionalLight(0xffffff, 1.2);
        sun.position.set(10, 20, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        this.scene.add(sun);

        // Teal & Purple "Rim Lights" for Cinematic feel
        const rim1 = new THREE.PointLight(0x00d4ff, 2, 20);
        rim1.position.set(-10, 5, -5);
        this.scene.add(rim1);
    }

    private init(theme: any) {
        // High-Gloss Grid
        const grid = new THREE.GridHelper(20, 20, parseInt(theme.grid), 0x111111);
        grid.receiveShadow = true;
        this.scene.add(grid);
    }
}
