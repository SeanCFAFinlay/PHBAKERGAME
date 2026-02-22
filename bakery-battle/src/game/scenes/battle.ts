import { Scene } from "./scene";

export type Cell = { col: number; row: number };
export type Vec2 = { x: number; y: number };

export function screenToCell(
  screenX: number,
  screenY: number,
  cellSize: number,
  offset: { x: number; y: number } = { x: 0, y: 0 }
): Cell {
  const col = Math.floor((screenX - offset.x) / cellSize);
  const row = Math.floor((screenY - offset.y) / cellSize);
  return { col, row };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function cellCenter(cell: Cell, cellSize: number, origin: Vec2): Vec2 {
  return {
    x: origin.x + cell.col * cellSize + cellSize / 2,
    y: origin.y + cell.row * cellSize + cellSize / 2,
  };
}

function cellRect(cell: Cell, cellSize: number, origin: Vec2) {
  return {
    x: origin.x + cell.col * cellSize,
    y: origin.y + cell.row * cellSize,
    w: cellSize,
    h: cellSize,
  };
}

type TowerTypeId = "cookieCannon" | "frostingSlow" | "chocoSplash";

type TowerType = {
  id: TowerTypeId;
  name: string;
  cost: number;
  range: number;      // in px
  fireRate: number;   // shots/sec
  damage: number;
  projectileSpeed: number;
  splashRadius: number; // px
  slowPct: number;      // 0..1
  slowSeconds: number;
};

type Tower = {
  id: number;
  typeId: TowerTypeId;
  level: number;
  cell: Cell;
  pos: Vec2;
  fireCooldown: number;
  totalSpent: number;
};

type EnemyTypeId = "dentist" | "hygienist" | "boss";

type EnemyType = {
  id: EnemyTypeId;
  name: string;
  maxHp: number;
  speed: number;
  reward: number;
  size: number;
};

type Enemy = {
  id: number;
  typeId: EnemyTypeId;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  size: number;
  pathIndex: number;
  alive: boolean;
  slowPct: number;
  slowTimer: number;
};

type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  damage: number;
  splashRadius: number;
  slowPct: number;
  slowSeconds: number;
};

type Wave = {
  name: string;
  spawns: Array<{ typeId: EnemyTypeId; count: number; interval: number }>;
};

type UiButton = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

function pointInRect(p: Vec2, r: { x: number; y: number; w: number; h: number }): boolean {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

export class BattleScene extends Scene {
  private readonly cellSize: number;

  // Grid / arena
  private gridCols = 17;
  private gridRows = 13;
  private origin: Vec2 = { x: 0, y: 0 };

  // Input
  private pointer: Vec2 = { x: 0, y: 0 };
  private pointerCell: Cell = { col: -999, row: -999 };

  // Gameplay state
  private t = 0;
  private coins = 150;
  private lives = 20;

  private paused = false;
  private timeScale = 1.0;

  // IDs
  private nextTowerId = 1;
  private nextEnemyId = 1;

  // Entities
  private towers: Tower[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];

  // Selection / build mode
  private buildMode: TowerTypeId | null = "cookieCannon";
  private selectedTowerId: number | null = null;

  // Path nodes (cells)
  private pathNodes: Cell[] = [];

  // Waves
  private waves: Wave[] = [];
  private waveIndex = 0;
  private waveActive = false;
  private waveSpawnGroupIndex = 0;
  private waveSpawnCountLeft = 0;
  private waveSpawnTimer = 0;

  // UI buttons
  private buttonsTop: UiButton[] = [];
  private buttonsRight: UiButton[] = [];

  // Catalogs
  private readonly towerTypes: Record<TowerTypeId, TowerType> = {
    cookieCannon: {
      id: "cookieCannon",
      name: "Cookie Cannon",
      cost: 50,
      range: 48 * 3.1,
      fireRate: 0.9,
      damage: 12,
      projectileSpeed: 650,
      splashRadius: 0,
      slowPct: 0,
      slowSeconds: 0,
    },
    frostingSlow: {
      id: "frostingSlow",
      name: "Frosting Slow",
      cost: 70,
      range: 48 * 2.8,
      fireRate: 0.6,
      damage: 6,
      projectileSpeed: 560,
      splashRadius: 0,
      slowPct: 0.45,
      slowSeconds: 1.4,
    },
    chocoSplash: {
      id: "chocoSplash",
      name: "Choco Splash",
      cost: 90,
      range: 48 * 2.6,
      fireRate: 0.55,
      damage: 10,
      projectileSpeed: 520,
      splashRadius: 38,
      slowPct: 0,
      slowSeconds: 0,
    },
  };

  private readonly enemyTypes: Record<EnemyTypeId, EnemyType> = {
    dentist: { id: "dentist", name: "Dentist", maxHp: 40, speed: 75, reward: 6, size: 10 },
    hygienist: { id: "hygienist", name: "Hygienist", maxHp: 70, speed: 62, reward: 9, size: 11 },
    boss: { id: "boss", name: "Boss", maxHp: 350, speed: 46, reward: 35, size: 16 },
  };

  constructor(engine: unknown, options: { cellSize?: number } = {}) {
    super(engine as any);
    this.cellSize = options.cellSize ?? 48;

    // Path: snake-ish, more interesting than the placeholder
    const mid = Math.floor(this.gridRows / 2);
    this.pathNodes = [
      { col: 0, row: mid },
      { col: 4, row: mid },
      { col: 4, row: 2 },
      { col: 9, row: 2 },
      { col: 9, row: this.gridRows - 3 },
      { col: 13, row: this.gridRows - 3 },
      { col: 13, row: 4 },
      { col: this.gridCols - 1, row: 4 },
    ];

    this.waves = [
      { name: "Warmup", spawns: [{ typeId: "dentist", count: 12, interval: 0.75 }] },
      { name: "Fresh Grins", spawns: [{ typeId: "dentist", count: 16, interval: 0.62 }] },
      {
        name: "Floss Force",
        spawns: [
          { typeId: "dentist", count: 10, interval: 0.55 },
          { typeId: "hygienist", count: 8, interval: 0.85 },
        ],
      },
      {
        name: "Cavity Crew",
        spawns: [
          { typeId: "dentist", count: 12, interval: 0.50 },
          { typeId: "hygienist", count: 10, interval: 0.78 },
          { typeId: "boss", count: 1, interval: 1.0 },
        ],
      },
    ];
  }

  // -----------------------------
  // Input hooks from main.ts
  // -----------------------------
  handlePointerMove(x: number, y: number): void {
    this.pointer = { x, y };
    this.pointerCell = screenToCell(x, y, this.cellSize, this.origin);
  }

  handlePointerDown(x: number, y: number): void {
    const p = { x, y };

    // UI first
    for (const b of this.buttonsTop) {
      if (pointInRect(p, b)) {
        this.onTopButton(b.id);
        return;
      }
    }
    for (const b of this.buttonsRight) {
      if (pointInRect(p, b)) {
        this.onRightButton(b.id);
        return;
      }
    }

    // If clicking on a tower, select it
    const clickedTower = this.towers.find((t) => t.cell.col === this.pointerCell.col && t.cell.row === this.pointerCell.row);
    if (clickedTower) {
      this.selectedTowerId = clickedTower.id;
      this.buildMode = null;
      return;
    }

    // Place if in build mode
    if (this.buildMode) {
      this.tryPlaceTower(this.buildMode, this.pointerCell);
    } else {
      // Deselect if empty
      this.selectedTowerId = null;
    }
  }

  handleKeyDown(key: string): void {
    const k = key.toLowerCase();

    if (k === " ") {
      this.paused = !this.paused;
      return;
    }
    if (k === "1") { this.buildMode = "cookieCannon"; this.selectedTowerId = null; return; }
    if (k === "2") { this.buildMode = "frostingSlow"; this.selectedTowerId = null; return; }
    if (k === "3") { this.buildMode = "chocoSplash"; this.selectedTowerId = null; return; }

    if (k === "n") {
      this.startNextWave();
      return;
    }

    if (k === "+") { this.timeScale = clamp(this.timeScale + 0.25, 0.5, 3.0); return; }
    if (k === "-") { this.timeScale = clamp(this.timeScale - 0.25, 0.5, 3.0); return; }

    if (k === "u") { this.tryUpgradeSelected(); return; }
    if (k === "s") { this.trySellSelected(); return; }
  }

  // -----------------------------
  // Core mechanics
  // -----------------------------
  private recomputeArena(w: number, h: number): void {
    const gridW = this.gridCols * this.cellSize;
    const gridH = this.gridRows * this.cellSize;

    // Leave room for a right panel UI
    const rightPanelW = 260;
    const usableW = Math.max(300, w - rightPanelW);

    this.origin = {
      x: Math.floor((usableW - gridW) / 2),
      y: Math.floor((h - gridH) / 2),
    };
  }

  private isInGrid(cell: Cell): boolean {
    return cell.col >= 0 && cell.col < this.gridCols && cell.row >= 0 && cell.row < this.gridRows;
  }

  private isPathCell(cell: Cell): boolean {
    for (let i = 0; i < this.pathNodes.length - 1; i++) {
      const a = this.pathNodes[i];
      const b = this.pathNodes[i + 1];

      if (a.col === b.col) {
        const c = a.col;
        const r0 = Math.min(a.row, b.row);
        const r1 = Math.max(a.row, b.row);
        if (cell.col === c && cell.row >= r0 && cell.row <= r1) return true;
      } else if (a.row === b.row) {
        const r = a.row;
        const c0 = Math.min(a.col, b.col);
        const c1 = Math.max(a.col, b.col);
        if (cell.row === r && cell.col >= c0 && cell.col <= c1) return true;
      }
    }
    return false;
  }

  private pathPoints(): Vec2[] {
    const pts: Vec2[] = [];
    for (let i = 0; i < this.pathNodes.length - 1; i++) {
      const a = this.pathNodes[i];
      const b = this.pathNodes[i + 1];

      if (a.col === b.col) {
        const c = a.col;
        const step = b.row >= a.row ? 1 : -1;
        for (let r = a.row; r !== b.row + step; r += step) {
          pts.push(cellCenter({ col: c, row: r }, this.cellSize, this.origin));
        }
      } else if (a.row === b.row) {
        const r = a.row;
        const step = b.col >= a.col ? 1 : -1;
        for (let c = a.col; c !== b.col + step; c += step) {
          pts.push(cellCenter({ col: c, row: r }, this.cellSize, this.origin));
        }
      } else {
        pts.push(cellCenter(a, this.cellSize, this.origin));
        pts.push(cellCenter(b, this.cellSize, this.origin));
      }
    }
    return pts;
  }

  private canPlaceTower(cell: Cell): boolean {
    if (!this.isInGrid(cell)) return false;
    if (this.isPathCell(cell)) return false;
    if (this.towers.some((t) => t.cell.col === cell.col && t.cell.row === cell.row)) return false;
    return true;
  }

  private tryPlaceTower(typeId: TowerTypeId, cell: Cell): void {
    const type = this.towerTypes[typeId];
    if (!type) return;
    if (!this.canPlaceTower(cell)) return;
    if (this.coins < type.cost) return;

    const pos = cellCenter(cell, this.cellSize, this.origin);
    const tower: Tower = {
      id: this.nextTowerId++,
      typeId,
      level: 1,
      cell,
      pos,
      fireCooldown: 0,
      totalSpent: type.cost,
    };
    this.towers.push(tower);
    this.coins -= type.cost;
    this.selectedTowerId = tower.id;
  }

  private computeTowerStats(t: Tower): TowerType {
    const base = this.towerTypes[t.typeId];

    // Simple upgrade scaling per level
    const lvl = t.level;
    return {
      ...base,
      range: base.range * (1 + (lvl - 1) * 0.08),
      fireRate: base.fireRate * (1 + (lvl - 1) * 0.12),
      damage: base.damage * (1 + (lvl - 1) * 0.18),
      splashRadius: base.splashRadius * (1 + (lvl - 1) * 0.10),
      slowPct: base.slowPct,
      slowSeconds: base.slowSeconds * (1 + (lvl - 1) * 0.08),
    };
  }

  private upgradeCost(t: Tower): number {
    // Escalating upgrade cost
    const base = this.towerTypes[t.typeId].cost;
    return Math.floor(base * (0.75 + t.level * 0.55));
  }

  private sellValue(t: Tower): number {
    // 70% refund of total spent
    return Math.floor(t.totalSpent * 0.70);
  }

  private tryUpgradeSelected(): void {
    if (!this.selectedTowerId) return;
    const t = this.towers.find((x) => x.id === this.selectedTowerId);
    if (!t) return;

    const cost = this.upgradeCost(t);
    if (this.coins < cost) return;

    this.coins -= cost;
    t.level += 1;
    t.totalSpent += cost;
  }

  private trySellSelected(): void {
    if (!this.selectedTowerId) return;
    const idx = this.towers.findIndex((x) => x.id === this.selectedTowerId);
    if (idx < 0) return;

    const t = this.towers[idx];
    this.coins += this.sellValue(t);
    this.towers.splice(idx, 1);
    this.selectedTowerId = null;
  }

  private spawnEnemy(typeId: EnemyTypeId): void {
    const type = this.enemyTypes[typeId];
    const pts = this.pathPoints();
    if (pts.length < 2) return;

    const hpScaled = Math.floor(type.maxHp * (1 + this.waveIndex * 0.12));
    const speedScaled = type.speed * (1 + this.waveIndex * 0.03);

    this.enemies.push({
      id: this.nextEnemyId++,
      typeId,
      x: pts[0].x,
      y: pts[0].y,
      hp: hpScaled,
      maxHp: hpScaled,
      speed: speedScaled,
      reward: type.reward,
      size: type.size,
      pathIndex: 0,
      alive: true,
      slowPct: 0,
      slowTimer: 0,
    });
  }

  private startNextWave(): void {
    if (this.waveActive) return;
    if (this.waveIndex >= this.waves.length) return;
    this.waveActive = true;
    this.waveSpawnGroupIndex = 0;
    this.waveSpawnTimer = 0;

    const g0 = this.waves[this.waveIndex].spawns[0];
    this.waveSpawnCountLeft = g0 ? g0.count : 0;
  }

  private updateWave(dt: number): void {
    if (!this.waveActive) return;
    const wave = this.waves[this.waveIndex];
    if (!wave) { this.waveActive = false; return; }

    const group = wave.spawns[this.waveSpawnGroupIndex];
    if (!group) {
      // done spawning all groups; wave ends when enemies cleared
      if (this.enemies.some((e) => e.alive)) return;

      this.waveActive = false;
      this.waveIndex += 1;
      this.coins += 40; // wave bonus
      return;
    }

    this.waveSpawnTimer += dt;
    if (this.waveSpawnTimer >= group.interval) {
      this.waveSpawnTimer = 0;

      if (this.waveSpawnCountLeft > 0) {
        this.spawnEnemy(group.typeId);
        this.waveSpawnCountLeft -= 1;
      }

      if (this.waveSpawnCountLeft <= 0) {
        this.waveSpawnGroupIndex += 1;
        const next = wave.spawns[this.waveSpawnGroupIndex];
        this.waveSpawnCountLeft = next ? next.count : 0;
      }
    }
  }

  private updateEnemies(dt: number): void {
    const pts = this.pathPoints();

    for (const e of this.enemies) {
      if (!e.alive) continue;

      // slow handling
      if (e.slowTimer > 0) {
        e.slowTimer -= dt;
        if (e.slowTimer <= 0) {
          e.slowTimer = 0;
          e.slowPct = 0;
        }
      }

      const i = e.pathIndex;
      const a = pts[i];
      const b = pts[i + 1];

      if (!a || !b) {
        e.alive = false;
        this.lives -= 1;
        continue;
      }

      const speed = e.speed * (1 - e.slowPct);
      const dx = b.x - e.x;
      const dy = b.y - e.y;
      const d = Math.hypot(dx, dy);
      const step = speed * dt;

      if (d <= step) {
        e.x = b.x;
        e.y = b.y;
        e.pathIndex += 1;
      } else {
        e.x += (dx / d) * step;
        e.y += (dy / d) * step;
      }

      if (e.hp <= 0) {
        e.alive = false;
        this.coins += e.reward;
      }
    }
  }

  private fireFromTower(t: Tower, target: Enemy, stats: TowerType): void {
    const ang = Math.atan2(target.y - t.pos.y, target.x - t.pos.x);
    const speed = stats.projectileSpeed;

    this.projectiles.push({
      x: t.pos.x,
      y: t.pos.y,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      ttl: 0.9,
      damage: stats.damage,
      splashRadius: stats.splashRadius,
      slowPct: stats.slowPct,
      slowSeconds: stats.slowSeconds,
    });
  }

  private updateTowers(dt: number): void {
    for (const t of this.towers) {
      const stats = this.computeTowerStats(t);

      t.fireCooldown -= dt;
      if (t.fireCooldown > 0) continue;

      let best: Enemy | null = null;
      let bestD = Infinity;

      for (const e of this.enemies) {
        if (!e.alive) continue;
        const d = dist(t.pos, { x: e.x, y: e.y });
        if (d <= stats.range && d < bestD) {
          bestD = d;
          best = e;
        }
      }

      if (best) {
        this.fireFromTower(t, best, stats);
        t.fireCooldown = 1 / stats.fireRate;
      }
    }
  }

  private applyHit(e: Enemy, dmg: number, slowPct: number, slowSeconds: number): void {
    e.hp -= dmg;
    if (slowPct > 0 && slowSeconds > 0) {
      e.slowPct = Math.max(e.slowPct, slowPct);
      e.slowTimer = Math.max(e.slowTimer, slowSeconds);
    }
  }

  private updateProjectiles(dt: number): void {
    for (const p of this.projectiles) {
      p.ttl -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.ttl <= 0) continue;

      // collision: near any enemy
      for (const e of this.enemies) {
        if (!e.alive) continue;

        const d = dist({ x: p.x, y: p.y }, { x: e.x, y: e.y });
        if (d <= e.size + 5) {
          if (p.splashRadius > 0) {
            // splash damage to all in radius
            for (const e2 of this.enemies) {
              if (!e2.alive) continue;
              const ds = dist({ x: p.x, y: p.y }, { x: e2.x, y: e2.y });
              if (ds <= p.splashRadius) {
                this.applyHit(e2, p.damage, p.slowPct, p.slowSeconds);
              }
            }
          } else {
            this.applyHit(e, p.damage, p.slowPct, p.slowSeconds);
          }

          p.ttl = -1;
          break;
        }
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.ttl > 0);
  }

  // -----------------------------
  // UI actions
  // -----------------------------
  private onTopButton(id: string): void {
    if (id === "pause") { this.paused = !this.paused; return; }
    if (id === "speedDown") { this.timeScale = clamp(this.timeScale - 0.25, 0.5, 3.0); return; }
    if (id === "speedUp") { this.timeScale = clamp(this.timeScale + 0.25, 0.5, 3.0); return; }
    if (id === "nextWave") { this.startNextWave(); return; }
  }

  private onRightButton(id: string): void {
    if (id === "build_cookieCannon") { this.buildMode = "cookieCannon"; this.selectedTowerId = null; return; }
    if (id === "build_frostingSlow") { this.buildMode = "frostingSlow"; this.selectedTowerId = null; return; }
    if (id === "build_chocoSplash") { this.buildMode = "chocoSplash"; this.selectedTowerId = null; return; }
    if (id === "upgrade") { this.tryUpgradeSelected(); return; }
    if (id === "sell") { this.trySellSelected(); return; }
  }

  // -----------------------------
  // Update / Render
  // -----------------------------
  update(dt: number): void {
    if (this.lives <= 0) return;

    // scaled time
    const step = this.paused ? 0 : dt * this.timeScale;
    this.t += step;

    if (step <= 0) return;

    this.updateWave(step);
    this.updateEnemies(step);
    this.updateTowers(step);
    this.updateProjectiles(step);

    // cleanup
    if (this.enemies.length > 250) {
      this.enemies = this.enemies.filter((e) => e.alive);
    }
  }

  render(ctx: CanvasRenderingContext2D, width?: number, height?: number): void {
    const w = width ?? ctx.canvas.width;
    const h = height ?? ctx.canvas.height;

    this.recomputeArena(w, h);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#060910";
    ctx.fillRect(0, 0, w, h);

    const gridW = this.gridCols * this.cellSize;
    const gridH = this.gridRows * this.cellSize;

    // Right panel
    const panelW = 260;
    const panelX = w - panelW;
    ctx.fillStyle = "rgba(10,14,20,0.95)";
    ctx.fillRect(panelX, 0, panelW, h);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.strokeRect(panelX + 0.5, 0.5, panelW - 1, h - 1);

    // Arena card
    const pad = 16;
    const cardX = this.origin.x - pad;
    const cardY = this.origin.y - pad;
    const cardW = gridW + pad * 2;
    const cardH = gridH + pad * 2;

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(cardX + 6, cardY + 10, cardW, cardH);

    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(cardX, cardY, cardW, cardH);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.strokeRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1);

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let c = 0; c <= this.gridCols; c++) {
      const x = this.origin.x + c * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, this.origin.y);
      ctx.lineTo(x, this.origin.y + gridH);
      ctx.stroke();
    }
    for (let r = 0; r <= this.gridRows; r++) {
      const y = this.origin.y + r * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(this.origin.x, y);
      ctx.lineTo(this.origin.x + gridW, y);
      ctx.stroke();
    }

    // Path
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = { col: c, row: r };
        if (!this.isPathCell(cell)) continue;

        const rr = cellRect(cell, this.cellSize, this.origin);
        ctx.fillStyle = "rgba(255, 184, 77, 0.14)";
        ctx.fillRect(rr.x, rr.y, rr.w, rr.h);
        ctx.strokeStyle = "rgba(255, 184, 77, 0.18)";
        ctx.strokeRect(rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1);
      }
    }

    // Spawn + Goal marker
    const pts = this.pathPoints();
    if (pts.length >= 2) {
      const spawn = pts[0];
      const goal = pts[pts.length - 1];

      ctx.fillStyle = "rgba(77, 182, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(spawn.x, spawn.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(255, 99, 99, 0.95)";
      ctx.beginPath();
      ctx.arc(goal.x, goal.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hover highlight (placement validity)
    const hoverInGrid = this.isInGrid(this.pointerCell);
    if (hoverInGrid) {
      const rr = cellRect(this.pointerCell, this.cellSize, this.origin);
      const canPlace = this.buildMode ? this.canPlaceTower(this.pointerCell) : false;

      ctx.fillStyle = this.buildMode
        ? (canPlace ? "rgba(0, 200, 120, 0.10)" : "rgba(255, 80, 80, 0.10)")
        : "rgba(255,255,255,0.03)";
      ctx.fillRect(rr.x, rr.y, rr.w, rr.h);

      ctx.strokeStyle = this.buildMode
        ? (canPlace ? "rgba(0, 200, 120, 0.75)" : "rgba(255, 80, 80, 0.75)")
        : "rgba(255,255,255,0.10)";
      ctx.strokeRect(rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1);
    }

    // Towers
    for (const t of this.towers) {
      const stats = this.computeTowerStats(t);
      const selected = this.selectedTowerId === t.id;

      // Base
      ctx.fillStyle = t.typeId === "cookieCannon"
        ? "rgba(170, 120, 255, 0.95)"
        : (t.typeId === "frostingSlow" ? "rgba(120, 200, 255, 0.95)" : "rgba(255, 140, 70, 0.95)");

      ctx.beginPath();
      ctx.arc(t.pos.x, t.pos.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = selected ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(t.pos.x, t.pos.y, 12.5, 0, Math.PI * 2);
      ctx.stroke();

      // Level pip
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(t.pos.x - 8, t.pos.y - 28, 16, 14);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "11px system-ui, Segoe UI, Arial";
      ctx.fillText(`Lv${t.level}`, t.pos.x - 7, t.pos.y - 17);

      // Range circle if selected
      if (selected) {
        ctx.strokeStyle = "rgba(0, 160, 255, 0.25)";
        ctx.beginPath();
        ctx.arc(t.pos.x, t.pos.y, stats.range, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;

      // body
      ctx.fillStyle = e.typeId === "boss" ? "rgba(255, 70, 90, 0.95)" : "rgba(255, 105, 105, 0.95)";
      ctx.fillRect(e.x - e.size, e.y - e.size, e.size * 2, e.size * 2);

      // slow overlay
      if (e.slowPct > 0 && e.slowTimer > 0) {
        ctx.fillStyle = "rgba(120, 200, 255, 0.25)";
        ctx.fillRect(e.x - e.size, e.y - e.size, e.size * 2, e.size * 2);
      }

      // hp bar
      const bw = 28;
      const bh = 5;
      const hpT = clamp(e.hp / e.maxHp, 0, 1);

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(e.x - bw / 2, e.y - (e.size + 12), bw, bh);

      const r = Math.floor(255 - 140 * hpT);
      const g = Math.floor(80 + 150 * hpT);
      ctx.fillStyle = `rgba(${r}, ${g}, 90, 0.95)`;
      ctx.fillRect(e.x - bw / 2, e.y - (e.size + 12), bw * hpT, bh);
    }

    // Projectiles
    for (const p of this.projectiles) {
      ctx.fillStyle = p.slowPct > 0 ? "rgba(120, 200, 255, 0.92)" : "rgba(255, 255, 255, 0.92)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pointer debug (keeps pointer "used" + helps aiming/placement feel)
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(this.pointer.x, this.pointer.y, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Top HUD + buttons
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "14px system-ui, Segoe UI, Arial";
    const waveName = this.waves[this.waveIndex]?.name ?? "Endless (soon)";
    ctx.fillText(`Coins: ${this.coins}`, cardX, cardY - 10);
    ctx.fillText(`Lives: ${this.lives}`, cardX + 110, cardY - 10);
    ctx.fillText(`Wave: ${this.waveIndex + 1} - ${waveName}`, cardX + 210, cardY - 10);
    ctx.fillText(`Speed: ${this.timeScale.toFixed(2)}x`, cardX + 520, cardY - 10);
    ctx.fillText(this.paused ? "PAUSED" : "", cardX + 660, cardY - 10);

    // Build UI buttons each render (positions depend on window)
    this.buttonsTop = [];
    const topBtnY = 10;
    let topBtnX = panelX - 360;

    const addTopBtn = (id: string, label: string) => {
      const b: UiButton = { id, label, x: topBtnX, y: topBtnY, w: 82, h: 26 };
      this.buttonsTop.push(b);
      topBtnX += b.w + 10;
    };

    addTopBtn("pause", this.paused ? "Resume" : "Pause");
    addTopBtn("speedDown", "- Speed");
    addTopBtn("speedUp", "+ Speed");
    addTopBtn("nextWave", "Next Wave");

    for (const b of this.buttonsTop) {
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "12px system-ui, Segoe UI, Arial";
      ctx.fillText(b.label, b.x + 10, b.y + 17);
    }

    // Right panel UI (build + selected)
    this.buttonsRight = [];
    const px = panelX + 16;
    let py = 18;

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "16px system-ui, Segoe UI, Arial";
    ctx.fillText("Build", px, py + 16);
    py += 26;

    const addBuildBtn = (typeId: TowerTypeId) => {
      const ttype = this.towerTypes[typeId];
      const active = this.buildMode === typeId;

      const b: UiButton = { id: `build_${typeId}`, label: `${ttype.name} ($${ttype.cost})`, x: px, y: py, w: 228, h: 32 };
      this.buttonsRight.push(b);

      ctx.fillStyle = active ? "rgba(0, 160, 255, 0.14)" : "rgba(255,255,255,0.06)";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = active ? "rgba(0, 160, 255, 0.38)" : "rgba(255,255,255,0.12)";
      ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "12px system-ui, Segoe UI, Arial";
      ctx.fillText(b.label, b.x + 10, b.y + 20);

      py += 40;
    };

    addBuildBtn("cookieCannon");
    addBuildBtn("frostingSlow");
    addBuildBtn("chocoSplash");

    py += 12;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.font = "16px system-ui, Segoe UI, Arial";
    ctx.fillText("Selected", px, py + 16);
    py += 26;

    const sel = this.selectedTowerId ? this.towers.find((t) => t.id === this.selectedTowerId) : null;
    if (!sel) {
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "12px system-ui, Segoe UI, Arial";
      ctx.fillText("Click a tower to inspect.", px, py + 16);
      ctx.fillText("Hotkeys: 1/2/3 build, U upgrade, S sell", px, py + 36);
      ctx.fillText("Space pause, N next wave, +/- speed", px, py + 56);
    } else {
      const st = this.computeTowerStats(sel);
      const upgradeCost = this.upgradeCost(sel);
      const sellValue = this.sellValue(sel);

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "12px system-ui, Segoe UI, Arial";
      ctx.fillText(`${this.towerTypes[sel.typeId].name}  Lv${sel.level}`, px, py + 14);
      ctx.fillText(`DMG: ${st.damage.toFixed(0)}  Rate: ${st.fireRate.toFixed(2)}/s`, px, py + 34);
      ctx.fillText(`Range: ${st.range.toFixed(0)}px`, px, py + 54);

      if (st.slowPct > 0) ctx.fillText(`Slow: ${(st.slowPct * 100).toFixed(0)}% for ${st.slowSeconds.toFixed(1)}s`, px, py + 74);
      if (st.splashRadius > 0) ctx.fillText(`Splash: ${st.splashRadius.toFixed(0)}px`, px, py + 74);

      py += 92;

      const bUp: UiButton = { id: "upgrade", label: `Upgrade (U) - $${upgradeCost}`, x: px, y: py, w: 228, h: 32 };
      this.buttonsRight.push(bUp);
      ctx.fillStyle = this.coins >= upgradeCost ? "rgba(0, 200, 120, 0.12)" : "rgba(255, 80, 80, 0.10)";
      ctx.fillRect(bUp.x, bUp.y, bUp.w, bUp.h);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.strokeRect(bUp.x + 0.5, bUp.y + 0.5, bUp.w - 1, bUp.h - 1);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "12px system-ui, Segoe UI, Arial";
      ctx.fillText(bUp.label, bUp.x + 10, bUp.y + 20);

      py += 40;

      const bSell: UiButton = { id: "sell", label: `Sell (S) +$${sellValue}`, x: px, y: py, w: 228, h: 32 };
      this.buttonsRight.push(bSell);
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(bSell.x, bSell.y, bSell.w, bSell.h);
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.strokeRect(bSell.x + 0.5, bSell.y + 0.5, bSell.w - 1, bSell.h - 1);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText(bSell.label, bSell.x + 10, bSell.y + 20);
    }

    // Game over overlay
    if (this.lives <= 0) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "56px system-ui, Segoe UI, Arial";
      ctx.fillText("GAME OVER", this.origin.x + 40, this.origin.y + gridH / 2);

      ctx.font = "16px system-ui, Segoe UI, Arial";
      ctx.fillText("Refresh to restart (restart UI coming next).", this.origin.x + 44, this.origin.y + gridH / 2 + 34);
    }
  }
}

// Factory wrapper: your main.ts uses createBattle({ cellSize })
export function createBattle(options: { cellSize: number }) {
  const engineStub = { setScene: (_scene: unknown) => {} };
  return new BattleScene(engineStub, { cellSize: options.cellSize });
}

