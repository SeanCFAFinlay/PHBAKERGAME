import { create } from 'zustand';
import { AssetManifestEntry, AssetOverride } from '@shared/types';

interface EditorState {
  selectedAsset: AssetManifestEntry | null;
  assets: AssetManifestEntry[];
  overrides: Record<string, AssetOverride>;
  currentTab: 'assets' | 'maps' | 'waves' | 'ai-preview';

  setSelectedAsset: (asset: AssetManifestEntry | null) => void;
  setAssets: (assets: AssetManifestEntry[]) => void;
  setOverrides: (overrides: Record<string, AssetOverride>) => void;
  updateOverride: (id: string, override: AssetOverride) => void;
  setCurrentTab: (tab: EditorState['currentTab']) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedAsset: null,
  assets: [],
  overrides: {},
  currentTab: 'assets',

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  setAssets: (assets) => set({ assets }),
  setOverrides: (overrides) => set({ overrides }),
  updateOverride: (id, override) =>
    set((state) => ({
      overrides: { ...state.overrides, [id]: override },
    })),
  setCurrentTab: (tab) => set({ currentTab: tab }),
}));
