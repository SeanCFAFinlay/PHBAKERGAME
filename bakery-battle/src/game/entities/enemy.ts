export class Enemy {
  x: number;
  y: number;
  hp = 10;
  alive = true;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  update(_dt: number) {}

  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.fill();
  }
}
