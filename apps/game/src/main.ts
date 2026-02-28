import { BattleScene } from "../../bakery-battle/scenes/BattleScene"; window.addEventListener("load", () => { const c = document.getElementById("game-canvas"); if(c) new BattleScene(c); });
