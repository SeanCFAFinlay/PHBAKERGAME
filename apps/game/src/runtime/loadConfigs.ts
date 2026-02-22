import { loadManifestAndOverrides } from '@shared/loaders';
export async function loadConfigs() {
  return await loadManifestAndOverrides();
}
