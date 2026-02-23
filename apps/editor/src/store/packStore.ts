import { create } from 'zustand';
import type { Asset, MapDefinition } from '@pack/types';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

interface PackState {
  assets: Asset[];
  maps: MapDefinition[];
  selectedAsset: Asset | null;
  selectedMap: MapDefinition | null;
  currentTab: 'assets' | 'mapbuilder' | 'exportimport' | 'howto';

  addAsset: (asset: Asset) => void;
  updateAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  addMap: (map: MapDefinition) => void;
  updateMap: (map: MapDefinition) => void;
  deleteMap: (id: string) => void;
  setSelectedAsset: (asset: Asset | null) => void;
  setSelectedMap: (map: MapDefinition | null) => void;
  setCurrentTab: (tab: PackState['currentTab']) => void;
  setAssets: (assets: Asset[]) => void;
  setMaps: (maps: MapDefinition[]) => void;
}

export const usePackStore = create<PackState>((set) => ({
  assets: loadFromStorage<Asset[]>('phbg_assets', []),
  maps: loadFromStorage<MapDefinition[]>('phbg_maps', []),
  selectedAsset: null,
  selectedMap: null,
  currentTab: 'assets',

  addAsset: (asset) =>
    set((state) => {
      const assets = [...state.assets, asset];
      saveToStorage('phbg_assets', assets);
      return { assets };
    }),

  updateAsset: (asset) =>
    set((state) => {
      const assets = state.assets.map((a) => (a.id === asset.id ? asset : a));
      saveToStorage('phbg_assets', assets);
      return { assets };
    }),

  deleteAsset: (id) =>
    set((state) => {
      const assets = state.assets.filter((a) => a.id !== id);
      saveToStorage('phbg_assets', assets);
      return {
        assets,
        selectedAsset: state.selectedAsset?.id === id ? null : state.selectedAsset,
      };
    }),

  addMap: (map) =>
    set((state) => {
      const maps = [...state.maps, map];
      saveToStorage('phbg_maps', maps);
      return { maps };
    }),

  updateMap: (map) =>
    set((state) => {
      const maps = state.maps.map((m) => (m.id === map.id ? map : m));
      saveToStorage('phbg_maps', maps);
      return { maps };
    }),

  deleteMap: (id) =>
    set((state) => {
      const maps = state.maps.filter((m) => m.id !== id);
      saveToStorage('phbg_maps', maps);
      return {
        maps,
        selectedMap: state.selectedMap?.id === id ? null : state.selectedMap,
      };
    }),

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  setSelectedMap: (map) => set({ selectedMap: map }),
  setCurrentTab: (tab) => set({ currentTab: tab }),

  setAssets: (assets) => {
    saveToStorage('phbg_assets', assets);
    set({ assets });
  },

  setMaps: (maps) => {
    saveToStorage('phbg_maps', maps);
    set({ maps });
  },
}));
