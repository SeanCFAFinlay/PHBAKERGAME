import { Enemy } from "./enemy";

export class Tower {
  cooldown = 0;
  x: number;
  y: number;
  range: number;
  fireRate: number;

  constructor(
    x: number,
    y: number,
    range = 160,
    fireRate = 2 // shots/sec
  ) {
    this.x = x;
    this.y = y;
    this.range = range;
    this.fireRate = fireRate;
  }

  update(dt: number, enemies: Enemy[], spawnProjectile: (x:number,y:number,tx:number,ty:number)=>void) {
    this.cooldown -= dt;
    if (this.cooldown > 0) return;

    // find nearest in range
    let best: Enemy | null = null;
    let bestD = Infinity;

    for (const e of enemies) {
      if (!e.alive) continue;
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d <= this.range && d < bestD) {
        best = e;
        bestD = d;
      }
    }

    if (best) {
      this.cooldown = 1 / this.fireRate;
      spawnProjectile(this.x, this.y, best.x, best.y);
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x - 14, this.y - 14, 28, 28);

    // range ring (subtle)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
    ctx.stroke();
  }
}
