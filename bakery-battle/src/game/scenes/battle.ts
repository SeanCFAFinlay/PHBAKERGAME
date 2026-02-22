import { Engine } from '../core/engine';
import { findPath, point, type Point } from '../systems/path';
import { Scene } from './scene';

export class BattleScene extends Scene {
  private path: Point[];

  constructor(engine: Engine) {
    super(engine);
    // Simple "S" path across the field (tile coords, not pixels)
    this.path = [
      { x: 0, y: 6 }, { x: 5, y: 6 }, { x: 5, y: 2 },
      { x: 10, y: 2 }, { x: 10, y: 9 }, { x: 15, y: 9 },
      { x: 19, y: 9 },
    ];
  }

  update(_dt: number): void {
    // Update game logic here
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!ctx) return;

    // Render the path for debugging
    ctx.strokeStyle = '#4a9c5d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    this.path.forEach((p, i) => {
      const x = p.x * 40;
      const y = p.y * 40;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
}

export function runBattleExample(): Point[] {
  const start: Point = point(0, 0);
  const end: Point = point(8, 5);
  return findPath(start, end);
}
