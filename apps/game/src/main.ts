import { showScreen } from "./ui/screens/screens";
import { BattleScene } from "../../../bakery-battle/scenes/BattleScene";

declare global {
  interface Window {
    selectTheme: (theme: "bakery" | "dentist") => void;
    startGame: (levelId: string) => void;
    goMenu: () => void;
  }
}

let scene: BattleScene | null = null;
let selectedTheme: "bakery" | "dentist" = "bakery";
let selectedLevel = "level1";

function ensureScene() {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement | null;
  if (!canvas) {
    console.error("Missing #gameCanvas in index.html");
    return null;
  }
  if (!scene) scene = new BattleScene(canvas);
  return scene;
}

window.selectTheme = (theme) => {
  selectedTheme = theme;
  showScreen("mapScreen");
};

window.startGame = (levelId) => {
  selectedLevel = levelId;
  showScreen("gameScreen");
  ensureScene();
  // Later: scene?.loadTheme(selectedTheme); scene?.loadLevel(selectedLevel);
};

window.goMenu = () => {
  showScreen("menuScreen");
};

window.addEventListener("DOMContentLoaded", () => {
  showScreen("menuScreen");
});
