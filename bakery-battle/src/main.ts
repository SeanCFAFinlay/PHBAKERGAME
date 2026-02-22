import "./style.css";
import { startGame } from "./game/main";

try {
  startGame();
} catch (err) {
  const pre = document.createElement("pre");
  pre.style.whiteSpace = "pre-wrap";
  pre.style.padding = "16px";
  pre.style.fontFamily = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  pre.textContent = String(err instanceof Error ? err.stack ?? err.message : err);
  document.body.appendChild(pre);
  throw err;
}
