import { Scene } from "./scene";
import { BattleScene } from "./battle";

export class MenuScene extends Scene {
  private onClick = () => this.engine.setScene(new BattleScene(this.engine));

  onEnter() {
    window.addEventListener("click", this.onClick);
  }

  onExit() {
    window.removeEventListener("click", this.onClick);
  }

  update(_: number) {}

  render(ctx: CanvasRenderingContext2D) {
    if (!ctx) return;

    ctx.font = "56px sans-serif";
    ctx.fillText("Bakery Battle", 60, 120);
    ctx.font = "26px sans-serif";
    ctx.fillText("Click anywhere to start", 60, 170);
  }
}
