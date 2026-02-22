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

export class BattleScene extends Scene {
  private readonly cellSize: number;
  private target: Cell | null = null;
  private t = 0;

  constructor(engine: unknown, options: { cellSize?: number } = {}) {
    super(engine as any);
    this.cellSize = options.cellSize ?? 48;
  }

  setTargetCell(cell: Cell): void {
    this.target = cell;
  }

  update(dt: number): void {
    this.t += dt;
  }

  render(ctx: CanvasRenderingContext2D, width?: number, height?: number): void {
    const w = width ?? ctx.canvas.width;
    const h = height ?? ctx.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;

    const cols = Math.ceil(w / this.cellSize);
    const rows = Math.ceil(h / this.cellSize);

    for (let c = 0; c <= cols; c++) {
      const x = c * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    for (let r = 0; r <= rows; r++) {
      const y = r * this.cellSize;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (this.target) {
      const x = this.target.col * this.cellSize;
      const y = this.target.row * this.cellSize;

      ctx.fillStyle = "rgba(0, 160, 255, 0.25)";
      ctx.fillRect(x, y, this.cellSize, this.cellSize);

      ctx.strokeStyle = "rgba(0, 160, 255, 0.9)";
      ctx.strokeRect(x + 0.5, y + 0.5, this.cellSize - 1, this.cellSize - 1);
    }

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "14px system-ui, Segoe UI, Arial";
    ctx.fillText(`Bakery Battle (BattleScene placeholder)  t=${this.t.toFixed(2)}`, 12, 22);
    ctx.fillText("Click a cell to set target", 12, 42);
  }
}

// Factory wrapper to keep src/game/main.ts working without an Engine instance
export function createBattle(options: { cellSize: number }) {
  const engineStub = { setScene: (_scene: unknown) => {} };
  return new BattleScene(engineStub, { cellSize: options.cellSize });
}
