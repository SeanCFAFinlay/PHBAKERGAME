import type { MapDefinition, PackExport } from '@shared/types';

export class MapSelectScreen {
  private el: HTMLDivElement;
  private container: HTMLElement;

  constructor(
    container: HTMLElement,
    theme: 'bakery' | 'dentist',
    onMapSelect: (map: MapDefinition) => void,
    onBack: () => void
  ) {
    this.container = container;

    this.el = document.createElement('div');
    this.el.style.cssText = [
      'position:absolute;inset:0;display:flex;flex-direction:column;',
      'align-items:center;background:rgba(10,12,18,0.97);color:#fff;',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      'z-index:10;padding:2rem;overflow-y:auto;',
    ].join('');

    const maps = this.getMaps(theme);
    const slots: (MapDefinition | null)[] = [null, null, null, null, null];
    for (const m of maps) {
      const idx = (m.slot as number) - 1;
      if (idx >= 0 && idx < 5) slots[idx] = m;
    }

    const themeEmoji = theme === 'bakery' ? '🧁' : '🦷';
    const themeLabel = theme === 'bakery' ? 'Bakery' : 'Dentist';

    const cardStyle = (filled: boolean) =>
      filled
        ? 'background:rgba(255,255,255,0.08);border-radius:12px;padding:1.5rem;cursor:pointer;border:2px solid rgba(255,255,255,0.15);text-align:center;min-width:160px;'
        : 'background:rgba(255,255,255,0.04);border-radius:12px;padding:1.5rem;border:2px dashed rgba(255,255,255,0.1);text-align:center;min-width:160px;color:#555;';

    const gridItems = slots
      .map((map, i) => {
        if (map) {
          return `<div style="${cardStyle(true)}">
            <div style="font-size:2rem;">${themeEmoji}</div>
            <div style="font-weight:bold;margin:0.5rem 0;">${this.esc(map.name)}</div>
            <div style="color:#aaa;font-size:0.85rem;margin-bottom:0.5rem;">Slot ${map.slot}</div>
            <div style="margin-bottom:0.75rem;">⭐☆☆</div>
            <button class="play-btn" data-slot="${i}"
              style="padding:0.5rem 1.5rem;border-radius:8px;background:#27ae60;
                     border:none;color:#fff;cursor:pointer;font-size:0.95rem;">
              ▶ Play
            </button>
          </div>`;
        }
        return `<div style="${cardStyle(false)}">
          <div style="font-size:2rem;">➕</div>
          <div style="margin-top:0.5rem;">Empty Slot</div>
          <div style="font-size:0.8rem;color:#333;">Slot ${i + 1}</div>
        </div>`;
      })
      .join('');

    this.el.innerHTML = `
      <div style="width:100%;max-width:900px;">
        <div style="display:flex;align-items:center;margin-bottom:2rem;gap:1rem;">
          <button id="back-btn"
            style="padding:0.5rem 1rem;border-radius:8px;
                   background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);
                   color:#fff;cursor:pointer;">
            ← Back
          </button>
          <h2 style="font-size:1.5rem;">${themeEmoji} ${themeLabel} Maps</h2>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center;">
          ${gridItems}
        </div>
      </div>
    `;

    (this.el.querySelector('#back-btn') as HTMLButtonElement).addEventListener('click', onBack);

    this.el.querySelectorAll<HTMLButtonElement>('.play-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset['slot']);
        const map = slots[idx];
        if (map) onMapSelect(map);
      });
    });

    container.appendChild(this.el);
    this.hide();
  }

  private esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  private getMaps(theme: 'bakery' | 'dentist'): MapDefinition[] {
    const defaultMaps: Record<'bakery' | 'dentist', MapDefinition[]> = {
      bakery: [
        {
          id: 'default_b1',
          name: 'Bakery Lane',
          theme: 'bakery',
          slot: 1,
          entities: [],
          createdAt: 0,
          updatedAt: 0,
        },
      ],
      dentist: [
        {
          id: 'default_d1',
          name: 'Tooth Alley',
          theme: 'dentist',
          slot: 1,
          entities: [],
          createdAt: 0,
          updatedAt: 0,
        },
      ],
    };

    const found: MapDefinition[] = [];

    for (const key of ['phbg_maps', 'phbg_pack_import']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (key === 'phbg_pack_import') {
          const pack = parsed as PackExport;
          if (pack?.maps) {
            found.push(...pack.maps.filter((m) => m.theme === theme));
          }
        } else if (Array.isArray(parsed)) {
          found.push(...(parsed as MapDefinition[]).filter((m) => m.theme === theme));
        }
      } catch {
        // ignore parse errors
      }
    }

    return found.length > 0 ? found : defaultMaps[theme];
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
