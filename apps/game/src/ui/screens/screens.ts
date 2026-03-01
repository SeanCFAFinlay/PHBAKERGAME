export type ScreenName = "menuScreen" | "mapScreen" | "gameScreen";

export function showScreen(name: ScreenName) {
  const ids: ScreenName[] = ["menuScreen", "mapScreen", "gameScreen"];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("active", id === name);
  }
}
