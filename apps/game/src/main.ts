import { BattleScene } from '/bakery-battle/scenes/BattleScene.ts';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (canvas) {
    try {
      new BattleScene(canvas);
      console.log("Bakery Battle: Engine Online");
    } catch (e) {
      console.error("Engine Start Failed:", e);
    }
  }
});
