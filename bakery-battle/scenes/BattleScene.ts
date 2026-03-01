import * as THREE from "three";

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

  private raycaster = new THREE.Raycaster();
  private mouseNdc = new THREE.Vector2();
  private ground = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );

  private ghost: THREE.Mesh | null = null;
  private selectedTower: { icon: string; cost: number } | null = null;
  private canPlace: ((cost: number) => boolean) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c12);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 16, 14);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.initGraphics();
    this.bindInput(canvas);
    this.animate();
  }

  private initGraphics() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 20, 10);
    this.scene.add(dir);

    const grid = new THREE.GridHelper(16, 16, 0x22c55e, 0x22314a);
    this.scene.add(grid);

    this.ground.rotation.x = -Math.PI / 2;
    this.scene.add(this.ground);

    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /** Hook from UI: which tower is selected */
  public setSelectedTower(t: { icon: string; cost: number } | null) {
    this.selectedTower = t;
    if (!t) { this.removeGhost(); return; }
    this.createGhost();
  }

  /** Hook from UI: buy validation (money) */
  public setCanPlace(fn: (cost: number) => boolean) {
    this.canPlace = fn;
  }

  private bindInput(canvas: HTMLCanvasElement) {
    canvas.addEventListener("pointermove", (e) => {
      this.updateMouse(e, canvas);
      this.updateGhost();
    });

    canvas.addEventListener("pointerdown", (e) => {
      this.updateMouse(e, canvas);
      const hit = this.hitGround();
      if (!hit || !this.selectedTower) return;

      const cost = this.selectedTower.cost;
      if (this.canPlace && !this.canPlace(cost)) {
        this.spawnSprinkles(hit.x, hit.z, 0xef4444);
        return;
      }

      this.placeTower(hit.x, hit.z);
      this.spawnSprinkles(hit.x, hit.z, 0xffd700);
    });
  }

  private updateMouse(e: PointerEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    this.mouseNdc.set(x, y);
  }

  private hitGround(): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.mouseNdc, this.camera);
    const hits = this.raycaster.intersectObject(this.ground, false);
    if (!hits.length) return null;
    const p = hits[0].point;

    // snap to grid centers (integer cells)
    const snapped = new THREE.Vector3(
      Math.round(p.x),
      0,
      Math.round(p.z)
    );

    // keep inside 16x16 area
    snapped.x = THREE.MathUtils.clamp(snapped.x, -7, 7);
    snapped.z = THREE.MathUtils.clamp(snapped.z, -7, 7);

    return snapped;
  }

  private createGhost() {
    this.removeGhost();
    const geo = new THREE.CylinderGeometry(0.35, 0.4, 0.3, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.45 });
    this.ghost = new THREE.Mesh(geo, mat);
    this.ghost.position.set(0, 0.15, 0);
    this.scene.add(this.ghost);
  }

  private removeGhost() {
    if (!this.ghost) return;
    this.scene.remove(this.ghost);
    this.ghost = null;
  }

  private updateGhost() {
    if (!this.ghost || !this.selectedTower) return;
    const hit = this.hitGround();
    if (!hit) return;
    this.ghost.position.set(hit.x, 0.15, hit.z);
  }

  private placeTower(x: number, z: number) {
    // simple tower geometry for now (we'll theme later)
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.5, 0.25, 12),
      new THREE.MeshStandardMaterial({ color: 0x1a2639, metalness: 0.2, roughness: 0.7 })
    );
    base.position.set(x, 0.125, z);

    const head = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.2, 0.06, 64, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.8, roughness: 0.2 })
    );
    head.position.set(x, 0.6, z);

    this.scene.add(base, head);
  }

  // SPRINKLE EXPLOSION
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
      p.vx *= 0.95; p.vz *= 0.95;
      p.vy -= 20 * dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      p.life -= dt;
      p.mesh.scale.setScalar(Math.max(0, p.life));
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
