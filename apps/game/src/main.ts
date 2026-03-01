import { BattleScene } from "../../../bakery-battle/scenes/BattleScene";

window.addEventListener("DOMContentLoaded", () => {
  // Match the prototype canvas ID if it exists:
  const canvas =
    (document.getElementById("gameCanvas") as HTMLCanvasElement | null) ??
    (document.getElementById("game-canvas") as HTMLCanvasElement | null);

  if (!canvas) {
    console.error("Canvas not found (expected #gameCanvas or #game-canvas).");
    return;
  }

  new BattleScene(canvas);
});
