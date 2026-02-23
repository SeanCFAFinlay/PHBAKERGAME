import type { Asset, MapDefinition, PackExport, ValidationResult } from './types';

const ASSET_CATEGORIES = new Set(['tower', 'enemy', 'obstacle', 'pen', 'ui', 'character', 'fx']);
const ASSET_THEMES = new Set(['shared', 'bakery', 'dentist']);
const SIZE_HINTS = new Set(['normal', 'big']);
const MAP_THEMES = new Set(['bakery', 'dentist']);
const MAP_SLOTS = new Set([1, 2, 3, 4, 5]);

export function validateAsset(asset: unknown): ValidationResult {
  const errors: string[] = [];
  if (typeof asset !== 'object' || asset === null) {
    return { valid: false, errors: ['asset must be an object'] };
  }
  const a = asset as Record<string, unknown>;
  if (typeof a['id'] !== 'string') errors.push('id must be a string');
  if (typeof a['name'] !== 'string') errors.push('name must be a string');
  if (typeof a['category'] !== 'string' || !ASSET_CATEGORIES.has(a['category'])) {
    errors.push(`category must be one of: ${[...ASSET_CATEGORIES].join(', ')}`);
  }
  if (typeof a['theme'] !== 'string' || !ASSET_THEMES.has(a['theme'])) {
    errors.push(`theme must be one of: ${[...ASSET_THEMES].join(', ')}`);
  }
  if (typeof a['sizeHint'] !== 'string' || !SIZE_HINTS.has(a['sizeHint'])) {
    errors.push(`sizeHint must be one of: ${[...SIZE_HINTS].join(', ')}`);
  }
  return { valid: errors.length === 0, errors };
}

export function validateMap(map: unknown): ValidationResult {
  const errors: string[] = [];
  if (typeof map !== 'object' || map === null) {
    return { valid: false, errors: ['map must be an object'] };
  }
  const m = map as Record<string, unknown>;
  if (typeof m['id'] !== 'string') errors.push('id must be a string');
  if (typeof m['name'] !== 'string') errors.push('name must be a string');
  if (typeof m['theme'] !== 'string' || !MAP_THEMES.has(m['theme'])) {
    errors.push(`theme must be one of: ${[...MAP_THEMES].join(', ')}`);
  }
  if (typeof m['slot'] !== 'number' || !MAP_SLOTS.has(m['slot'])) {
    errors.push(`slot must be one of: ${[...MAP_SLOTS].join(', ')}`);
  }
  if (!Array.isArray(m['entities'])) errors.push('entities must be an array');
  if (typeof m['createdAt'] !== 'number') errors.push('createdAt must be a number');
  if (typeof m['updatedAt'] !== 'number') errors.push('updatedAt must be a number');
  return { valid: errors.length === 0, errors };
}

export function exportPack(data: Omit<PackExport, 'version'>): string {
  return JSON.stringify({ version: 1, assets: data.assets, maps: data.maps });
}

export function importPack(json: string): PackExport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error('importPack: invalid JSON');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('importPack: root must be an object');
  }
  const p = parsed as Record<string, unknown>;
  if (typeof p['version'] !== 'number') {
    throw new Error('importPack: missing or invalid version');
  }
  if (!Array.isArray(p['assets'])) {
    throw new Error('importPack: assets must be an array');
  }
  if (!Array.isArray(p['maps'])) {
    throw new Error('importPack: maps must be an array');
  }
  const assets = (p['assets'] as unknown[]).filter((a) => validateAsset(a).valid) as Asset[];
  const maps = (p['maps'] as unknown[]).filter((m) => validateMap(m).valid) as MapDefinition[];
  return { version: p['version'] as number, assets, maps };
}
