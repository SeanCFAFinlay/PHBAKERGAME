import type { Asset, MapDefinition, PackExport } from '@shared/types';
import { MenuScreen } from './screens/MenuScreen';
import { MapSelectScreen } from './screens/MapSelectScreen';
import { GameScreen } from './screens/GameScreen';

type Screen = { show(): void; hide(): void; dispose(): void };

export class GameApp {
  private container: HTMLElement;
  private currentScreen: Screen | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.showMenu();
  }

  showMenu(): void {
    this.transitionTo(
      new MenuScreen(this.container, (theme) => {
        this.transitionTo(null);
        this.showMapSelect(theme);
      }),
    );
  }

  showMapSelect(theme: 'bakery' | 'dentist'): void {
    this.transitionTo(
      new MapSelectScreen(
        this.container,
        theme,
        (map) => {
          this.transitionTo(null);
          this.showGame(map, this.getStoredAssets());
        },
        () => {
          this.transitionTo(null);
          this.showMenu();
        },
      ),
    );
  }

  showGame(map: MapDefinition, assets: Asset[]): void {
    this.transitionTo(
      new GameScreen(this.container, map, assets, () => {
        this.transitionTo(null);
        this.showMenu();
      }),
    );
  }

  private transitionTo(screen: Screen | null): void {
    if (this.currentScreen) {
      this.currentScreen.dispose();
      this.currentScreen = null;
    }
    if (screen) {
      this.currentScreen = screen;
      screen.show();
    }
  }

  private getStoredAssets(): Asset[] {
    for (const key of ['phbg_assets', 'phbg_pack_import']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (key === 'phbg_pack_import') {
          const pack = parsed as PackExport;
          if (pack?.assets?.length) return pack.assets;
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Asset[];
        }
      } catch {
        // ignore parse errors
      }
    }
    return [];
  }
}
