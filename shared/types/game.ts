export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface GridConfig {
  w: number;
  h: number;
  tileSize: number;
}

export interface MapData {
  version: number;
  id: string;
  name: string;
  themeId: string;
  grid: GridConfig;
  path: Vector2[];
  spawns: Vector2[];
  goals: Vector2[];
  notes?: string;
}

export interface ThemeData {
  id: string;
  name: string;
  ground: string;
  path: string;
}

export interface BalanceConfig {
  version: number;
  economy: {
    startCash: number;
    towerSellRefund: number;
  };
  difficulty: {
    enemyHpMultiplier: number;
    enemySpeedMultiplier: number;
  };
}
