import { createBattle } from "@/game/scenes/battle";

const canvasEl = document.getElementById("game");
if (!(canvasEl instanceof HTMLCanvasElement)) {
  throw new Error('Missing <canvas id="game"> in index.html');
}
const canvas: HTMLCanvasElement = canvasEl;

const ctx2d = canvas.getContext("2d");
if (!ctx2d) {
  throw new Error("Canvas 2D context not available");
}
const ctx: CanvasRenderingContext2D = ctx2d;

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener("resize", resize);
resize();

const battle = createBattle({ cellSize: 48 });

canvas.addEventListener("click", (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  (battle as any).handleClick(mx, my);
});

let last = performance.now();
function loop(now: number): void {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  battle.update(dt);
  battle.render(ctx, window.innerWidth, window.innerHeight);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

export function startGame(): void {
  // Game boots on import (kept for compatibility).
}
