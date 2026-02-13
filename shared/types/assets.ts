export type AssetType = 'enemy' | 'tower' | 'prop' | 'ui';

export interface AssetManifestEntry {
  id: string;
  name: string;
  type: AssetType;
  file: string;
  thumbnail: string;
}

export interface AssetManifest {
  version: number;
  assets: AssetManifestEntry[];
}

export interface LODConfig {
  near: number;
  mid: number;
  far: number;
}

export interface MaterialOverride {
  color?: string;
  emissive?: string;
  roughness?: number;
  metalness?: number;
}

export interface HealthbarConfig {
  enabled: boolean;
  offsetY: number;
  width: number;
  height: number;
}

export interface HitboxConfig {
  size: [number, number, number];
  debug: boolean;
}

export interface IconBadgeConfig {
  enabled: boolean;
  icon: string;
  scale: number;
  offsetY: number;
  outline: boolean;
}

export interface AssetOverride {
  scale?: [number, number, number];
  rotation?: [number, number, number];
  offset?: [number, number, number];
  billboard?: boolean;
  spriteMode?: boolean;
  lod?: LODConfig;
  materialOverride?: MaterialOverride;
  healthbar?: HealthbarConfig;
  hitbox?: HitboxConfig;
  iconBadge?: IconBadgeConfig;
}

export interface AssetOverrides {
  [id: string]: AssetOverride;
}
