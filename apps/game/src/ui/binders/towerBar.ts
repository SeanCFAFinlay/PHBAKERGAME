import { spend, renderHud } from "../state/gameState";

export type TowerId = "mixer" | "brush";

export interface TowerDef {
  id: TowerId;
  name: string;
  icon: string;
  cost: number;
}

const towers: TowerDef[] = [
  { id: "mixer", name: "Mixer", icon: "🍰", cost: 100 },
  { id: "brush", name: "Brush", icon: "🦷", cost: 120 },
];

export function mountTowerBar(onSelect: (t: TowerDef) => void) {
  const bar = document.getElementById("towerBar");
  if (!bar) return;

  bar.innerHTML = "";
  for (const t of towers) {
    const btn = document.createElement("button");
    btn.className = "tower-btn";
    btn.innerHTML = `
      <div class="tower-btn-icon">${t.icon}</div>
      <div class="tower-btn-name">${t.name}</div>
      <div class="tower-btn-cost">${t.cost}</div>
    `;
    btn.addEventListener("click", () => onSelect(t));
    bar.appendChild(btn);
  }

  renderHud();
}

export function tryBuyTower(cost: number) {
  return spend(cost);
}
