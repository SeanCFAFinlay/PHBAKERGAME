import { Scene } from "../scenes/scene";
import { Input } from "./input";

export class Engine {
  private ctx!: CanvasRenderingContext2D;
  private scene?: Scene;
  private last = 0;

  readonly input: Input;
  canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not supported");
    this.ctx = ctx;
    this.input = new Input(canvas);
  }

  setScene(scene: Scene) {
    this.scene?.onExit?.();
    this.scene = scene;
    this.scene.onEnter?.();
  }

  start() {
    requestAnimationFrame(this.loop);
  }

  private loop = (t: number) => {
    const dt = Math.min(0.05, (t - this.last) / 1000 || 0);
    this.last = t;

    this.scene?.update(dt);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.scene?.render(this.ctx);

    requestAnimationFrame(this.loop);
  };
}
