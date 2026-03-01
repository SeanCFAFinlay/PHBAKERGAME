import { showScreen } from "./ui/screens/screens";
import { state, setTheme, renderHud, nextWave } from "./ui/state/gameState";
import { mountTowerBar, tryBuyTower, TowerDef } from "./ui/binders/towerBar";
import { BattleScene } from "../../../bakery-battle/scenes/BattleScene";

declare global {
  interface Window {
    selectTheme: (theme: "bakery" | "dentist") => void;
    startGame: (levelId: string) => void;
    goMenu: () => void;
  }
}

let scene: BattleScene | null = null;
let selected: TowerDef | null = null;

function ensureScene() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null;
  if (!canvas) {
    console.error("Missing #gameCanvas");
    return null;
  }
  if (!scene) {
    scene = new BattleScene(canvas);
    scene.setCanPlace((cost) => tryBuyTower(cost));
  }
  return scene;
}

function bindButtons() {
  const startBtn = document.getElementById("startBtn");
  if (startBtn) startBtn.addEventListener("click", () => nextWave());
}

window.selectTheme = (theme) => {
  setTheme(theme);
  showScreen("mapScreen");
};

window.startGame = () => {
  showScreen("gameScreen");
  renderHud();

  const s = ensureScene();
  bindButtons();

  mountTowerBar((t) => {
    selected = t;
    s?.setSelectedTower({ icon: t.icon, cost: t.cost });
  });
};

window.goMenu = () => {
  showScreen("menuScreen");
};

window.addEventListener("DOMContentLoaded", () => {
  showScreen("menuScreen");
  renderHud();
});
