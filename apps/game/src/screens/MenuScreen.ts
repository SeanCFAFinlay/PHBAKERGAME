import type { PackExport } from '@shared/types';
import { importPack } from '@shared/validation';

export class MenuScreen {
  private el: HTMLDivElement;
  private container: HTMLElement;

  constructor(container: HTMLElement, onThemeSelect: (theme: 'bakery' | 'dentist') => void) {
    this.container = container;

    this.el = document.createElement('div');
    this.el.style.cssText = [
      'position:absolute;inset:0;display:flex;flex-direction:column;',
      'align-items:center;justify-content:center;',
      'background:rgba(10,12,18,0.97);color:#fff;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;z-index:10;',
    ].join('');

    this.el.innerHTML = `
      <h1 style="font-size:2rem;margin-bottom:0.5rem;text-align:center;">
        🏰 Bakery vs Dentist: Tower Defense
      </h1>
      <p style="color:#aaa;margin-bottom:2rem;text-align:center;max-width:400px;padding:0 1rem;">
        Defend your turf in this delicious battle!
        Place towers to stop the invasion across 5 waves.
      </p>
      <div style="display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;justify-content:center;">
        <button id="btn-bakery"
          style="font-size:1.5rem;padding:1rem 2rem;border-radius:12px;
                 background:#c0392b;border:none;color:#fff;cursor:pointer;
                 transition:transform 0.1s;">
          🧁 Bakery
        </button>
        <button id="btn-dentist"
          style="font-size:1.5rem;padding:1rem 2rem;border-radius:12px;
                 background:#2980b9;border:none;color:#fff;cursor:pointer;
                 transition:transform 0.1s;">
          🦷 Dentist
        </button>
      </div>
      <button id="btn-import"
        style="padding:0.75rem 1.5rem;border-radius:8px;
               background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);
               color:#fff;cursor:pointer;font-size:1rem;">
        📦 Import Pack
      </button>
      <input id="file-import" type="file" accept=".json" style="display:none;" />
      <p id="import-status" style="color:#4caf50;margin-top:0.5rem;font-size:0.85rem;min-height:1.2em;"></p>
    `;

    const bakeryBtn = this.el.querySelector('#btn-bakery') as HTMLButtonElement;
    const dentistBtn = this.el.querySelector('#btn-dentist') as HTMLButtonElement;
    const importBtn = this.el.querySelector('#btn-import') as HTMLButtonElement;
    const fileInput = this.el.querySelector('#file-import') as HTMLInputElement;
    const statusEl = this.el.querySelector('#import-status') as HTMLElement;

    bakeryBtn.addEventListener('click', () => onThemeSelect('bakery'));
    dentistBtn.addEventListener('click', () => onThemeSelect('dentist'));
    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const pack: PackExport = importPack(ev.target!.result as string);
          localStorage.setItem('phbg_pack_import', JSON.stringify(pack));
          statusEl.style.color = '#4caf50';
          statusEl.textContent = `✓ Imported ${pack.assets.length} assets, ${pack.maps.length} maps`;
        } catch (err) {
          statusEl.style.color = '#f44336';
          statusEl.textContent = `✗ ${err instanceof Error ? err.message : 'Import failed'}`;
        }
      };
      reader.readAsText(file);
    });

    container.appendChild(this.el);
    this.hide();
  }

  show(): void {
    this.el.style.display = 'flex';
  }

  hide(): void {
    this.el.style.display = 'none';
  }

  dispose(): void {
    this.container.removeChild(this.el);
  }
}
