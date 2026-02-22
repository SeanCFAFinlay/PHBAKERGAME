import { Engine } from "../core/engine";

export type Point = { x: number; y: number };

export function makeSimplePath(): Point[] {
  // Simple "S" path across the field (tile coords, not pixels)
  return [
    { x: 0, y: 6 }, { x: 5, y: 6 }, { x: 5, y: 2 },
    { x: 10, y: 2 }, { x: 10, y: 9 }, { x: 15, y: 9 },
    { x: 19, y: 9 },
  ];
}

export class Scene {
  protected engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  onEnter?(): void {
    // Optional override
  }

  onExit?(): void {
    // Optional override
  }

  update(_dt: number): void {
    // Override required
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!ctx) return;
    // Override required
  }
}
