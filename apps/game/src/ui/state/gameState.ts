export type ThemeName = "bakery" | "dentist";

export interface GameState {
  theme: ThemeName;
  money: number;
  lives: number;
  wave: number;
  waveMax: number;
  building: boolean;
}

export const state: GameState = {
  theme: "bakery",
  money: 500,
  lives: 20,
  wave: 1,
  waveMax: 10,
  building: true,
};

function el(id: string) { return document.getElementById(id); }

export function renderHud() {
  const money = el("hudMoney");
  const lives = el("hudLives");
  const wave  = el("hudWave");

  if (money) money.textContent = `💰 ${state.money}`;
  if (lives) lives.textContent = `❤️ ${state.lives}`;
  if (wave)  wave.textContent  = `Wave ${state.wave}/${state.waveMax}`;
}

export function setTheme(theme: ThemeName) {
  state.theme = theme;
}

export function spend(cost: number) {
  if (state.money < cost) return false;
  state.money -= cost;
  renderHud();
  return true;
}

export function damageLives(amount: number) {
  state.lives = Math.max(0, state.lives - amount);
  renderHud();
}

export function nextWave() {
  state.wave = Math.min(state.waveMax, state.wave + 1);
  renderHud();
}
