import { createBattle, screenToCell } from "@/game/scenes/battle";

const canvas = document.getElementById("game") as HTMLCanvasElement | null;
if (!canvas) throw new Error('Missing <canvas id="game"> in index.html');

const ctx = canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2D context not available");

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
}
window.addEventListener("resize", resize);
resize();

const battle = createBattle();

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const cell = screenToCell(mx, my);
  battle.setTargetCell(cell);
});

let last = performance.now();
function loop(now: number) {
  const dt = Math.min(0.033, (now - last) / 1000); // clamp dt
  last = now;

  battle.update(dt);
  battle.render(ctx, window.innerWidth, window.innerHeight);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
