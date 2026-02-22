export type AssetType = 'enemy' | 'tower' | 'prop' | 'ui';

export type ManifestAsset = {
  id: string;
  name: string;
  type: AssetType;
  file: string; // /assets/images/foo.png or /assets/models/bar.glb
  thumbnail: string; // /assets/thumbnails/foo.png
  description?: string;
  tags?: string[];
};

export type AssetManifest = {
  version: number;
  assets: ManifestAsset[];
};

export type Vec3 = [number, number, number];

export type OverridesEntry = {
  scale?: Vec3;
  rotation?: Vec3;
  offset?: Vec3;

  billboard?: boolean;
  yAxisOnly?: boolean;
  spriteMode?: boolean;

  lod?: { near: number; mid: number; far: number };

  materialOverride?: {
    color?: string;
    emissive?: string;
    roughness?: number;
    metalness?: number;
  };

  healthbar?: {
    enabled: boolean;
    offsetY: number;
    width: number;
    height: number;
  };

  hitbox?: {
    size: Vec3;
    debug: boolean;
  };

  iconBadge?: {
    enabled: boolean;
    icon: string;
    scale: number;
    offsetY: number;
    outline: boolean;
  };
};

export type Overrides = Record<string, OverridesEntry>;
