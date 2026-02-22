import { Scene } from "./scene";

export type Cell = { col: number; row: number };

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

type Vec2 = { x: number; y: number };

type Tower = {
  cell: Cell;
  x: number;
  y: number;
  range: number;
  fireCooldown: number;
  fireRate: number;
};

type Enemy = {
  x: number;
  y: number;
  speed: number;
  hp: number;
  maxHp: number;
  pathIndex: number;
  alive: boolean;
};

type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  damage: number;
};

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function cellCenter(cell: Cell, cellSize: number, origin: Vec2): Vec2 {
  return {
    x: origin.x + cell.col * cellSize + cellSize / 2,
    y: origin.y + cell.row * cellSize + cellSize / 2,
  };
}

export class BattleScene extends Scene {
  private readonly cellSize: number;

  // Grid
  private gridCols = 15;
  private gridRows = 15;
  private origin: Vec2 = { x: 0, y: 0 };

  // Game state
  private t = 0;
  private coins = 120;
  private lives = 20;

  private towers: Tower[] = [];
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];

  // Click highlight
  private target: Cell | null = null;

  // Path nodes (later replace with JSON from Asset Manager)
  private pathNodes: Cell[] = [];

  // Wave/spawn
  private spawnTimer = 0;
  private waveTimer = 0;
  private wave = 1;

  constructor(engine: unknown, options: { cellSize?: number } = {}) {
    super(engine as any);
    this.cellSize = options.cellSize ?? 48;

    // Simple baked-in path: snake from left mid to right mid
    const mid = Math.floor(this.gridRows / 2);
    this.pathNodes = [
      { col: 0, row: mid },
      { col: 3, row: mid },
      { col: 3, row: mid - 3 },
      { col: 8, row: mid - 3 },
      { col: 8, row: mid + 3 },
      { col: 12, row: mid + 3 },
      { col: 12, row: mid },
      { col: this.gridCols - 1, row: mid },
    ];
  }

  setTargetCell(cell: Cell): void {
    this.target = cell;
  }

  private recomputeArena(w: number, h: number): void {
    const gridW = this.gridCols * this.cellSize;
    const gridH = this.gridRows * this.cellSize;
    this.origin = {
      x: Math.floor((w - gridW) / 2),
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

  private canPlaceTower(cell: Cell): boolean {
    if (!this.isInGrid(cell)) return false;
    if (this.isPathCell(cell)) return false;
    return !this.towers.some((t) => t.cell.col === cell.col && t.cell.row === cell.row);
  }

  private placeTowerAt(cell: Cell): void {
    const cost = 50;
    if (this.coins < cost) return;
    if (!this.canPlaceTower(cell)) return;

    const pos = cellCenter(cell, this.cellSize, this.origin);
    this.towers.push({
      cell,
      x: pos.x,
      y: pos.y,
      range: this.cellSize * 3.1,
      fireCooldown: 0,
      fireRate: 0.55,
    });
    this.coins -= cost;
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
        // fallback
        pts.push(cellCenter(a, this.cellSize, this.origin));
        pts.push(cellCenter(b, this.cellSize, this.origin));
      }
    }

    return pts;
  }

  private spawnEnemy(): void {
    const pts = this.pathPoints();
    if (pts.length < 2) return;

    const baseHp = 35 + this.wave * 6;
    const baseSpeed = 65 + this.wave * 2;

    this.enemies.push({
      x: pts[0].x,
      y: pts[0].y,
      speed: baseSpeed,
      hp: baseHp,
      maxHp: baseHp,
      pathIndex: 0,
      alive: true,
    });
  }

  update(dt: number): void {
    this.t += dt;

    if (this.lives <= 0) return;

    // Wave pacing: spawn enemies for N seconds, then pause until cleared
    this.waveTimer += dt;
    this.spawnTimer += dt;

    const spawnInterval = Math.max(0.35, 0.85 - this.wave * 0.04);
    const waveLength = 10.0;

    if (this.waveTimer < waveLength) {
      if (this.spawnTimer >= spawnInterval) {
        this.spawnTimer = 0;
        this.spawnEnemy();
      }
    } else {
      if (this.enemies.filter((e) => e.alive).length === 0) {
        this.wave += 1;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.coins += 35;
      }
    }

    // Move enemies along path
    const pts = this.pathPoints();
    for (const e of this.enemies) {
      if (!e.alive) continue;

      const i = e.pathIndex;
      const a = pts[i];
      const b = pts[i + 1];

      if (!a || !b) {
        e.alive = false;
        this.lives -= 1;
        continue;
      }

      const dx = b.x - e.x;
      const dy = b.y - e.y;
      const d = Math.hypot(dx, dy);
      const step = e.speed * dt;

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
        this.coins += 6;
      }
    }

    // Towers fire
    for (const t of this.towers) {
      t.fireCooldown -= dt;
      if (t.fireCooldown > 0) continue;

      let best: Enemy | null = null;
      let bestD = Infinity;

      for (const e of this.enemies) {
        if (!e.alive) continue;
        const d = dist({ x: t.x, y: t.y }, { x: e.x, y: e.y });
        if (d <= t.range && d < bestD) {
          bestD = d;
          best = e;
        }
      }

      if (best) {
        const ang = Math.atan2(best.y - t.y, best.x - t.x);
        const speed = 520;

        this.projectiles.push({
          x: t.x,
          y: t.y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          ttl: 0.9,
          damage: 12,
        });

        t.fireCooldown = 1 / t.fireRate;
      }
    }

    // Projectiles update + collision
    for (const p of this.projectiles) {
      p.ttl -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.ttl <= 0) continue;

      for (const e of this.enemies) {
        if (!e.alive) continue;
        const d = dist({ x: p.x, y: p.y }, { x: e.x, y: e.y });
        if (d <= 14) {
          e.hp -= p.damage;
          p.ttl = -1;
          break;
        }
      }
    }

    this.projectiles = this.projectiles.filter((p) => p.ttl > 0);
  }

  render(ctx: CanvasRenderingContext2D, width?: number, height?: number): void {
    const w = width ?? ctx.canvas.width;
    const h = height ?? ctx.canvas.height;

    this.recomputeArena(w, h);

    const gridW = this.gridCols * this.cellSize;
    const gridH = this.gridRows * this.cellSize;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = "#060910";
    ctx.fillRect(0, 0, w, h);

    // Card behind arena
    const pad = 18;
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

    // Path cells
    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const cell = { col: c, row: r };
        if (!this.isPathCell(cell)) continue;

        const x = this.origin.x + c * this.cellSize;
        const y = this.origin.y + r * this.cellSize;

        ctx.fillStyle = "rgba(255, 184, 77, 0.14)";
        ctx.fillRect(x, y, this.cellSize, this.cellSize);

        ctx.strokeStyle = "rgba(255, 184, 77, 0.18)";
        ctx.strokeRect(x + 0.5, y + 0.5, this.cellSize - 1, this.cellSize - 1);
      }
    }

    // Spawn + goal markers
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

    // Towers
    for (const t of this.towers) {
      ctx.fillStyle = "rgba(170, 120, 255, 0.95)";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 12.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;

      ctx.fillStyle = "rgba(255, 105, 105, 0.95)";
      ctx.fillRect(e.x - 10, e.y - 10, 20, 20);

      const bw = 24;
      const bh = 5;
      const hpT = clamp(e.hp / e.maxHp, 0, 1);

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(e.x - bw / 2, e.y - 18, bw, bh);

      ctx.fillStyle = `rgba(${Math.floor(lerp(255, 80, hpT))}, ${Math.floor(lerp(90, 230, hpT))}, 90, 0.95)`;
      ctx.fillRect(e.x - bw / 2, e.y - 18, bw * hpT, bh);
    }

    // Projectiles
    for (const p of this.projectiles) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Target highlight
    if (this.target && this.isInGrid(this.target)) {
      const x = this.origin.x + this.target.col * this.cellSize;
      const y = this.origin.y + this.target.row * this.cellSize;

      ctx.fillStyle = "rgba(0, 160, 255, 0.10)";
      ctx.fillRect(x, y, this.cellSize, this.cellSize);

      ctx.strokeStyle = "rgba(0, 160, 255, 0.85)";
      ctx.strokeRect(x + 0.5, y + 0.5, this.cellSize - 1, this.cellSize - 1);
    }

    // HUD
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    ctx.font = "14px system-ui, Segoe UI, Arial";
    ctx.fillText("Wave {this.wave}  |  Build: 2026-02-22 17:47:12", cardX, cardY - 8);
ctx.fillText(`Coins: ${this.coins}`, cardX + 90, cardY - 8);
    ctx.fillText(`Lives: ${this.lives}`, cardX + 200, cardY - 8);

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText("Click empty tiles to place Cookie Tower (50)", cardX, cardY + cardH + 18);

    if (this.lives <= 0) {
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "48px system-ui, Segoe UI, Arial";
      ctx.fillText("GAME OVER", this.origin.x + 40, this.origin.y + gridH / 2);
    }
  }

  // Called by main.ts click handler
  handleClick(screenX: number, screenY: number): void {
    const cell = screenToCell(screenX, screenY, this.cellSize, this.origin);
    this.setTargetCell(cell);
    if (this.canPlaceTower(cell)) {
      this.placeTowerAt(cell);
    }
  }
}

// Factory wrapper to keep src/game/main.ts working without an Engine instance
export function createBattle(options: { cellSize: number }) {
  const engineStub = { setScene: (_scene: unknown) => {} };
  return new BattleScene(engineStub, { cellSize: options.cellSize });
}

