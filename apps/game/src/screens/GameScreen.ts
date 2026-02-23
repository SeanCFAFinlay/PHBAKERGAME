import * as THREE from 'three';
import type { Asset, MapDefinition, MapEntity } from '@shared/types';

interface PlacedTower {
  id: string;
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  range: number;
  damage: number;
  fireRate: number;
  fireTimer: number;
  cost: number;
  assetId: string;
  upgradeLevel: number;
}

interface ActiveEnemy {
  id: string;
  mesh: THREE.Mesh;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  pathIndex: number;
  progress: number;
  isDead: boolean;
}

interface TowerType {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  damage: number;
  range: number;
  fireRate: number;
  color: number;
}

interface SpawnQueue {
  timer: number;
  spawned: number;
  total: number;
  interval: number;
}

const DEFAULT_TOWER_TYPES: TowerType[] = [
  {
    id: 'basic',
    name: 'BasicTower',
    emoji: '🗼',
    cost: 50,
    damage: 10,
    range: 3.0,
    fireRate: 1.0,
    color: 0x4488ff,
  },
  {
    id: 'ice',
    name: 'IceTower',
    emoji: '❄️',
    cost: 75,
    damage: 8,
    range: 3.5,
    fireRate: 0.8,
    color: 0x44ccff,
  },
  {
    id: 'fire',
    name: 'FireTower',
    emoji: '🔥',
    cost: 100,
    damage: 20,
    range: 2.5,
    fireRate: 1.5,
    color: 0xff4422,
  },
];

const DEFAULT_PATH: THREE.Vector3[] = [
  new THREE.Vector3(-8, 0.5, 0),
  new THREE.Vector3(-4, 0.5, 3),
  new THREE.Vector3(0, 0.5, 0),
  new THREE.Vector3(4, 0.5, -3),
  new THREE.Vector3(8, 0.5, 0),
];

export class GameScreen {
  private container: HTMLElement;
  private el: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();
  private map: MapDefinition;
  private assets: Asset[];
  private path: THREE.Vector3[] = [];
  private onBack: () => void;

  // Game state
  private money = 150;
  private lives = 20;
  private score = 0;
  private wave = 0;
  private waveActive = false;
  private gameOver = false;
  private speed = 1;
  private towers: PlacedTower[] = [];
  private enemies: ActiveEnemy[] = [];
  private enemySpawnQueue: SpawnQueue | null = null;
  private enemiesDefeated = 0;

  // Selection state
  private selectedTowerType: TowerType | null = null;
  private selectedTower: PlacedTower | null = null;
  private sellMode = false;

  // HUD refs
  private hudWave!: HTMLElement;
  private hudMoney!: HTMLElement;
  private hudLives!: HTMLElement;
  private hudScore!: HTMLElement;
  private btnStartWave!: HTMLButtonElement;
  private btnSpeed!: HTMLButtonElement;
  private btnSell!: HTMLButtonElement;
  private upgradeSheet!: HTMLDivElement;
  private modalEl!: HTMLDivElement;
  private towerBarEl!: HTMLDivElement;

  // Three.js
  private groundMesh!: THREE.Mesh;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private towerMeshMap: Map<string, PlacedTower> = new Map();

  private resizeHandler: () => void;
  private clickHandler: (e: Event) => void;

  constructor(container: HTMLElement, map: MapDefinition, assets: Asset[], onBack: () => void) {
    this.container = container;
    this.map = map;
    this.assets = assets;
    this.onBack = onBack;

    this.el = document.createElement('div');
    this.el.style.cssText =
      'position:absolute;inset:0;overflow:hidden;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

    // Three.js renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%!important;height:100%!important;';
    this.el.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    this.camera.position.set(0, 12, 10);
    this.camera.lookAt(0, 0, 0);

    this.resizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.resizeHandler);

    this.clickHandler = (e: Event) => this.handleClick(e as MouseEvent | TouchEvent);

    this.setupLights();
    this.setupGround();
    this.buildPath();
    this.setupMapEntities();
    this.buildHUD();
    this.handleResize();

    container.appendChild(this.el);
    this.hide();
  }

  private handleResize(): void {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  private setupLights(): void {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 10, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
    this.scene.add(dir);
  }

  private setupGround(): void {
    const color = this.map.theme === 'bakery' ? 0x4a7c59 : 0x3a5a8a;
    const geo = new THREE.PlaneGeometry(20, 20);
    const mat = new THREE.MeshStandardMaterial({ color });
    this.groundMesh = new THREE.Mesh(geo, mat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.receiveShadow = true;
    this.groundMesh.name = 'ground';
    this.scene.add(this.groundMesh);
  }

  private buildPath(): void {
    const toWorld = (e: MapEntity): THREE.Vector3 =>
      new THREE.Vector3((e.x - 0.5) * 18, 0.5, (e.y - 0.5) * 18);

    const spawns = this.map.entities.filter((e) => e.meta?.kind === 'spawn');
    const pens = this.map.entities.filter((e) => e.meta?.kind === 'pen');

    if (spawns.length > 0 && pens.length > 0) {
      this.path = [toWorld(spawns[0]), toWorld(pens[0])];
    } else {
      this.path = DEFAULT_PATH.map((v) => v.clone());
    }
  }

  private setupMapEntities(): void {
    for (const entity of this.map.entities) {
      const kind = entity.meta?.kind;
      const wx = (entity.x - 0.5) * 18;
      const wz = (entity.y - 0.5) * 18;

      let mesh: THREE.Mesh | null = null;

      if (kind === 'spawn') {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0x00ff44,
            emissive: 0x00ff44,
            emissiveIntensity: 0.5,
          })
        );
      } else if (kind === 'pen') {
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 8, 8),
          new THREE.MeshStandardMaterial({
            color: 0xff2244,
            emissive: 0xff2244,
            emissiveIntensity: 0.5,
          })
        );
      } else if (kind === 'obstacle') {
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: 0x7a5c2e })
        );
      } else if (kind === 'towerSpot') {
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 0.1, 12),
          new THREE.MeshStandardMaterial({ color: 0xffcc00 })
        );
        mesh.position.set(wx, 0.05, wz);
        this.scene.add(mesh);
        continue;
      }

      if (mesh) {
        mesh.position.set(wx, 0.5, wz);
        this.scene.add(mesh);
      }
    }
  }

  private buildHUD(): void {
    // Top bar
    const topBar = document.createElement('div');
    topBar.style.cssText =
      'position:absolute;top:0;left:0;right:0;display:flex;align-items:center;' +
      'gap:0.75rem;padding:0.5rem 1rem;background:rgba(0,0,0,0.75);color:#fff;' +
      'z-index:20;font-size:0.95rem;box-sizing:border-box;';

    const backBtn = document.createElement('button');
    backBtn.textContent = '← Menu';
    backBtn.style.cssText =
      'padding:0.3rem 0.75rem;border-radius:6px;background:rgba(255,255,255,0.1);' +
      'border:1px solid rgba(255,255,255,0.2);color:#fff;cursor:pointer;font-size:0.85rem;flex-shrink:0;';
    backBtn.addEventListener('click', () => this.onBack());

    this.hudWave = document.createElement('span');
    this.hudWave.style.cssText = 'flex:1;text-align:center;font-weight:bold;';
    this.hudMoney = document.createElement('span');
    this.hudLives = document.createElement('span');
    this.hudScore = document.createElement('span');

    topBar.append(backBtn, this.hudWave, this.hudMoney, this.hudLives, this.hudScore);
    this.el.appendChild(topBar);

    // Tower selection bar
    this.towerBarEl = document.createElement('div');
    this.towerBarEl.style.cssText =
      'position:absolute;bottom:52px;left:0;right:0;display:flex;gap:0.5rem;' +
      'padding:0.5rem 1rem;background:rgba(0,0,0,0.75);overflow-x:auto;z-index:20;';

    for (const tt of this.getTowerTypes()) {
      const btn = document.createElement('button');
      btn.dataset['ttId'] = tt.id;
      btn.style.cssText =
        'display:flex;flex-direction:column;align-items:center;padding:0.5rem 0.75rem;' +
        'border-radius:8px;background:rgba(255,255,255,0.1);' +
        'border:1px solid rgba(255,255,255,0.15);color:#fff;cursor:pointer;' +
        'min-width:70px;white-space:nowrap;flex-shrink:0;';
      btn.innerHTML = `
        <span style="font-size:1.4rem;">${tt.emoji}</span>
        <span style="font-size:0.75rem;">${this.esc(tt.name)}</span>
        <span style="font-size:0.8rem;color:#ffd700;">💰${tt.cost}</span>
      `;
      btn.addEventListener('click', () => this.selectTowerType(tt, btn));
      this.towerBarEl.appendChild(btn);
    }
    this.el.appendChild(this.towerBarEl);

    // Action bar
    const actionBar = document.createElement('div');
    actionBar.style.cssText =
      'position:absolute;bottom:0;left:0;right:0;display:flex;gap:0.5rem;' +
      'padding:0.4rem 1rem;background:rgba(0,0,0,0.85);z-index:20;';

    this.btnStartWave = document.createElement('button');
    this.btnStartWave.textContent = '▶ Start Wave';
    this.btnStartWave.style.cssText =
      'flex:1;padding:0.5rem;border-radius:8px;background:#27ae60;' +
      'border:none;color:#fff;cursor:pointer;font-weight:bold;';
    this.btnStartWave.addEventListener('click', () => this.startWave());

    this.btnSpeed = document.createElement('button');
    this.btnSpeed.textContent = '⏩ Speed x1';
    this.btnSpeed.style.cssText =
      'padding:0.5rem 1rem;border-radius:8px;background:rgba(255,255,255,0.1);' +
      'border:1px solid rgba(255,255,255,0.2);color:#fff;cursor:pointer;flex-shrink:0;';
    this.btnSpeed.addEventListener('click', () => this.toggleSpeed());

    this.btnSell = document.createElement('button');
    this.btnSell.textContent = '💰 Sell';
    this.btnSell.style.cssText =
      'padding:0.5rem 1rem;border-radius:8px;background:rgba(255,255,255,0.1);' +
      'border:1px solid rgba(255,255,255,0.2);color:#fff;cursor:pointer;flex-shrink:0;';
    this.btnSell.addEventListener('click', () => this.toggleSellMode());

    actionBar.append(this.btnStartWave, this.btnSpeed, this.btnSell);
    this.el.appendChild(actionBar);

    // Upgrade sheet
    this.upgradeSheet = document.createElement('div');
    this.upgradeSheet.style.cssText =
      'position:absolute;right:1rem;top:50%;transform:translateY(-50%);' +
      'background:rgba(0,0,0,0.85);border:1px solid rgba(255,255,255,0.2);' +
      'border-radius:12px;padding:1rem;color:#fff;z-index:30;min-width:160px;display:none;';
    this.el.appendChild(this.upgradeSheet);

    // End game modal
    this.modalEl = document.createElement('div');
    this.modalEl.style.cssText =
      'position:absolute;inset:0;display:none;align-items:center;' +
      'justify-content:center;background:rgba(0,0,0,0.7);z-index:50;';
    this.el.appendChild(this.modalEl);

    // Canvas interaction
    this.renderer.domElement.addEventListener('click', this.clickHandler);
    this.renderer.domElement.addEventListener('touchend', this.clickHandler, { passive: true });

    this.updateHUD();
  }

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private getTowerTypes(): TowerType[] {
    const fromAssets = this.assets
      .filter((a) => a.category === 'tower')
      .map(
        (a, i): TowerType => ({
          id: a.id,
          name: a.name,
          emoji: a.emoji ?? '🗼',
          cost: 50 + i * 25,
          damage: 10 + i * 5,
          range: 3.0,
          fireRate: 1.0,
          color: 0x4488ff,
        })
      );
    return fromAssets.length > 0 ? fromAssets : DEFAULT_TOWER_TYPES;
  }

  private updateHUD(): void {
    this.hudWave.textContent = `Wave ${this.wave}`;
    this.hudMoney.textContent = `💰 ${this.money}`;
    this.hudLives.textContent = `❤️ ${this.lives}`;
    this.hudScore.textContent = `⭐ ${this.score}`;
    this.btnStartWave.disabled = this.waveActive || this.gameOver;
    this.btnSell.style.background = this.sellMode ? '#c0392b' : 'rgba(255,255,255,0.1)';
  }

  private selectTowerType(tt: TowerType, btn: HTMLButtonElement): void {
    this.selectedTower = null;
    this.upgradeSheet.style.display = 'none';
    this.sellMode = false;

    const isAlreadySelected = this.selectedTowerType?.id === tt.id;
    this.clearTowerButtonBorders();

    if (isAlreadySelected) {
      this.selectedTowerType = null;
    } else {
      this.selectedTowerType = tt;
      btn.style.border = '2px solid #ffd700';
    }
    this.updateHUD();
  }

  private clearTowerButtonBorders(): void {
    this.towerBarEl.querySelectorAll<HTMLButtonElement>('button').forEach((b) => {
      b.style.border = '1px solid rgba(255,255,255,0.15)';
    });
  }

  private toggleSpeed(): void {
    this.speed = this.speed === 1 ? 2 : 1;
    this.btnSpeed.textContent = `⏩ Speed x${this.speed}`;
  }

  private toggleSellMode(): void {
    this.sellMode = !this.sellMode;
    this.selectedTowerType = null;
    this.clearTowerButtonBorders();
    this.updateHUD();
  }

  private startWave(): void {
    if (this.waveActive || this.gameOver) return;
    this.wave++;
    this.waveActive = true;
    const total = this.wave * 3 + 3;
    this.enemySpawnQueue = { timer: 0, spawned: 0, total, interval: 0.5 };
    this.updateHUD();
  }

  private spawnEnemy(): void {
    const id = `e${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const geo = new THREE.SphereGeometry(0.35, 8, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.path[0]);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.enemies.push({
      id,
      mesh,
      hp: 20 + this.wave * 10,
      maxHp: 20 + this.wave * 10,
      speed: 1 + this.wave * 0.1,
      reward: 5 + this.wave,
      pathIndex: 0,
      progress: 0,
      isDead: false,
    });
  }

  private disposeMesh(mesh: THREE.Mesh): void {
    mesh.geometry.dispose();
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat.dispose();
    this.scene.remove(mesh);
  }

  private handleClick(e: MouseEvent | TouchEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    let cx: number, cy: number;

    if ('changedTouches' in e) {
      if (!e.changedTouches[0]) return;
      cx = e.changedTouches[0].clientX;
      cy = e.changedTouches[0].clientY;
    } else {
      cx = e.clientX;
      cy = e.clientY;
    }

    this.pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Check tower hits first
    const towerMeshes = [...this.towerMeshMap.values()].map((t) => t.mesh);
    const towerHits = this.raycaster.intersectObjects(towerMeshes);

    if (towerHits.length > 0) {
      const hitMesh = towerHits[0].object as THREE.Mesh;
      const tower = [...this.towerMeshMap.values()].find((t) => t.mesh === hitMesh);
      if (tower) {
        if (this.sellMode) {
          this.sellTower(tower);
        } else {
          this.openUpgradeSheet(tower);
        }
        return;
      }
    }

    // Click on ground to place tower
    const groundHits = this.raycaster.intersectObject(this.groundMesh);
    if (groundHits.length > 0 && this.selectedTowerType && !this.sellMode) {
      const pt = groundHits[0].point;
      if (this.money >= this.selectedTowerType.cost) {
        this.placeTower(pt, this.selectedTowerType);
      }
      return;
    }

    // Deselect upgrade sheet on empty click
    if (towerHits.length === 0) {
      this.selectedTower = null;
      this.upgradeSheet.style.display = 'none';
    }
  }

  private placeTower(position: THREE.Vector3, tt: TowerType): void {
    const id = `t${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const geo = new THREE.CylinderGeometry(0.4, 0.5, 1.5, 8);
    const mat = new THREE.MeshStandardMaterial({ color: tt.color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(position.x, 0.75, position.z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const tower: PlacedTower = {
      id,
      mesh,
      position: mesh.position.clone(),
      range: tt.range,
      damage: tt.damage,
      fireRate: tt.fireRate,
      fireTimer: 0,
      cost: tt.cost,
      assetId: tt.id,
      upgradeLevel: 0,
    };
    this.towers.push(tower);
    this.towerMeshMap.set(id, tower);
    this.money -= tt.cost;
    this.updateHUD();
  }

  private sellTower(tower: PlacedTower): void {
    this.disposeMesh(tower.mesh);
    this.towers = this.towers.filter((t) => t.id !== tower.id);
    this.towerMeshMap.delete(tower.id);
    this.money += Math.floor(tower.cost * 0.5);
    if (this.selectedTower?.id === tower.id) {
      this.selectedTower = null;
      this.upgradeSheet.style.display = 'none';
    }
    this.updateHUD();
  }

  private openUpgradeSheet(tower: PlacedTower): void {
    this.selectedTower = tower;
    const upgradeCost = 50;
    const sellValue = Math.floor(tower.cost * 0.5);
    this.upgradeSheet.style.display = 'block';
    this.upgradeSheet.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <strong>${this.esc(tower.assetId)} Tower</strong>
        <button id="close-upgrade"
          style="background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem;">✕</button>
      </div>
      <div style="font-size:0.85rem;color:#aaa;margin-bottom:0.75rem;">
        <div>⚔️ DMG: ${tower.damage}</div>
        <div>🎯 RNG: ${tower.range.toFixed(1)}</div>
        <div>🔫 Rate: ${tower.fireRate}/s</div>
        <div>⬆️ Lvl: ${tower.upgradeLevel}</div>
      </div>
      <button id="upgrade-btn"
        style="width:100%;padding:0.4rem;border-radius:6px;background:#8e44ad;
               border:none;color:#fff;cursor:pointer;margin-bottom:0.4rem;">
        ⬆ Upgrade 💰${upgradeCost}
      </button>
      <button id="sell-tower-btn"
        style="width:100%;padding:0.4rem;border-radius:6px;background:#c0392b;
               border:none;color:#fff;cursor:pointer;">
        💰 Sell (${sellValue})
      </button>
    `;

    (this.upgradeSheet.querySelector('#close-upgrade') as HTMLButtonElement).addEventListener(
      'click',
      () => {
        this.selectedTower = null;
        this.upgradeSheet.style.display = 'none';
      }
    );

    (this.upgradeSheet.querySelector('#upgrade-btn') as HTMLButtonElement).addEventListener(
      'click',
      () => {
        if (this.money >= upgradeCost && this.selectedTower) {
          this.money -= upgradeCost;
          this.selectedTower.damage += 5;
          this.selectedTower.upgradeLevel++;
          this.openUpgradeSheet(this.selectedTower);
          this.updateHUD();
        }
      }
    );

    (this.upgradeSheet.querySelector('#sell-tower-btn') as HTMLButtonElement).addEventListener(
      'click',
      () => {
        if (this.selectedTower) this.sellTower(this.selectedTower);
      }
    );
  }

  private showEndModal(won: boolean): void {
    this.modalEl.style.display = 'flex';
    this.modalEl.innerHTML = `
      <div style="background:rgba(0,0,0,0.9);border:1px solid rgba(255,255,255,0.2);
                  border-radius:16px;padding:2rem;text-align:center;color:#fff;max-width:320px;">
        <div style="font-size:2.5rem;margin-bottom:0.5rem;">${won ? '🎉' : '💀'}</div>
        <h2 style="margin-bottom:1rem;">${won ? 'Victory!' : 'Defeat'}</h2>
        <div style="color:#aaa;font-size:0.9rem;margin-bottom:1.5rem;">
          <div>Waves survived: ${this.wave}</div>
          <div>Score: ${this.score}</div>
          <div>Enemies defeated: ${this.enemiesDefeated}</div>
        </div>
        <div style="display:flex;gap:0.75rem;justify-content:center;">
          <button id="modal-again"
            style="padding:0.6rem 1.2rem;border-radius:8px;background:#27ae60;
                   border:none;color:#fff;cursor:pointer;">
            ▶ Play Again
          </button>
          <button id="modal-menu"
            style="padding:0.6rem 1.2rem;border-radius:8px;background:rgba(255,255,255,0.1);
                   border:1px solid rgba(255,255,255,0.2);color:#fff;cursor:pointer;">
            🏠 Main Menu
          </button>
        </div>
      </div>
    `;

    (this.modalEl.querySelector('#modal-again') as HTMLButtonElement).addEventListener(
      'click',
      () => this.resetGame()
    );
    (this.modalEl.querySelector('#modal-menu') as HTMLButtonElement).addEventListener('click', () =>
      this.onBack()
    );
  }

  private resetGame(): void {
    for (const e of this.enemies) this.disposeMesh(e.mesh);
    for (const t of this.towers) this.disposeMesh(t.mesh);

    this.enemies = [];
    this.towers = [];
    this.towerMeshMap.clear();

    this.money = 150;
    this.lives = 20;
    this.score = 0;
    this.wave = 0;
    this.waveActive = false;
    this.gameOver = false;
    this.speed = 1;
    this.enemiesDefeated = 0;
    this.enemySpawnQueue = null;
    this.selectedTower = null;
    this.selectedTowerType = null;
    this.sellMode = false;

    this.modalEl.style.display = 'none';
    this.upgradeSheet.style.display = 'none';
    this.btnSpeed.textContent = '⏩ Speed x1';
    this.clearTowerButtonBorders();
    this.updateHUD();
  }

  private update(dt: number): void {
    if (this.gameOver) return;

    const scaledDt = dt * this.speed;

    // Spawn queued enemies
    if (this.enemySpawnQueue) {
      const q = this.enemySpawnQueue;
      q.timer += scaledDt;
      while (q.timer >= q.interval && q.spawned < q.total) {
        q.timer -= q.interval;
        q.spawned++;
        this.spawnEnemy();
      }
      if (q.spawned >= q.total) {
        this.enemySpawnQueue = null;
      }
    }

    // Move enemies along path
    for (const enemy of this.enemies) {
      if (enemy.isDead) continue;

      const nextIdx = enemy.pathIndex + 1;
      if (nextIdx >= this.path.length) {
        // Reached the end — remove a life
        this.lives = Math.max(0, this.lives - 1);
        enemy.isDead = true;
        this.disposeMesh(enemy.mesh);
        continue;
      }

      const from = this.path[enemy.pathIndex];
      const to = this.path[nextIdx];
      const segLen = from.distanceTo(to);
      if (segLen > 0) {
        enemy.progress += (enemy.speed * scaledDt) / segLen;
      }

      while (enemy.progress >= 1) {
        enemy.progress -= 1;
        enemy.pathIndex++;
        if (enemy.pathIndex + 1 >= this.path.length) {
          enemy.mesh.position.copy(this.path[enemy.pathIndex]);
          break;
        }
      }

      if (!enemy.isDead && enemy.pathIndex + 1 < this.path.length) {
        enemy.mesh.position.lerpVectors(
          this.path[enemy.pathIndex],
          this.path[enemy.pathIndex + 1],
          Math.min(enemy.progress, 1)
        );
      }
    }

    // Tower shooting
    for (const tower of this.towers) {
      tower.fireTimer += scaledDt;
      if (tower.fireTimer < 1 / tower.fireRate) continue;

      let closest: ActiveEnemy | null = null;
      let closestDist = Infinity;
      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const dist = tower.position.distanceTo(enemy.mesh.position);
        if (dist <= tower.range && dist < closestDist) {
          closest = enemy;
          closestDist = dist;
        }
      }

      if (closest) {
        tower.fireTimer = 0;
        closest.hp -= tower.damage;
        if (closest.hp <= 0) {
          closest.isDead = true;
          this.money += closest.reward;
          this.score += 10;
          this.enemiesDefeated++;
          this.disposeMesh(closest.mesh);
        }
      }
    }

    // Prune dead enemies
    this.enemies = this.enemies.filter((e) => !e.isDead);

    // Check wave completion
    if (this.waveActive && this.enemySpawnQueue === null && this.enemies.length === 0) {
      this.waveActive = false;
      if (this.wave >= 5 && this.lives > 0) {
        this.gameOver = true;
        this.showEndModal(true);
      }
    }

    // Check defeat
    if (this.lives <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.showEndModal(false);
    }

    this.updateHUD();
  }

  private animate(): void {
    this.animFrameId = requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  }

  show(): void {
    this.el.style.display = 'block';
    this.clock.start();
    this.animate();
  }

  hide(): void {
    this.el.style.display = 'none';
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  dispose(): void {
    this.hide();
    window.removeEventListener('resize', this.resizeHandler);
    this.renderer.domElement.removeEventListener('click', this.clickHandler);
    this.renderer.domElement.removeEventListener('touchend', this.clickHandler);
    for (const e of this.enemies) this.disposeMesh(e.mesh);
    for (const t of this.towers) this.disposeMesh(t.mesh);
    this.renderer.dispose();
    if (this.el.parentNode) this.container.removeChild(this.el);
  }
}
