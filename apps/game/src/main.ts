import { GameApp } from './GameApp';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('app');
  if (!container) throw new Error('No #app element');
  new GameApp(container);
});
