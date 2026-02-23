export type AssetCategory = 'tower' | 'enemy' | 'obstacle' | 'pen' | 'ui' | 'character' | 'fx';
export type AssetTheme = 'shared' | 'bakery' | 'dentist';
export type SizeHint = 'normal' | 'big';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  theme: AssetTheme;
  emoji?: string;
  sizeHint: SizeHint;
  desc?: string;
  imageDataUrl?: string;
}

export type MapEntityKind = 'spawn' | 'pen' | 'obstacle' | 'towerSpot';

export interface MapEntity {
  assetId: string;
  x: number; // 0..1 normalized
  y: number; // 0..1 normalized
  rotationDeg: number;
  scale: number;
  meta?: { kind?: MapEntityKind };
}

export type MapSlot = 1 | 2 | 3 | 4 | 5;
export type MapTheme = 'bakery' | 'dentist';

export interface MapDefinition {
  id: string;
  name: string;
  theme: MapTheme;
  slot: MapSlot;
  entities: MapEntity[];
  createdAt: number;
  updatedAt: number;
}

export interface PackExport {
  version: number;
  assets: Asset[];
  maps: MapDefinition[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
