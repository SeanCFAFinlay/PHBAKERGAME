import * as THREE from "three";
import type { AssetManifest, Overrides } from "@phbakergame/shared/schema";
import { Healthbar } from "../render/Healthbar";
import { createIconBadge } from "../render/IconBadge";

type Spawned = {
  id: string;
  root: THREE.Object3D;
  visual: THREE.Object3D;
  healthbar?: Healthbar;
  iconBadge?: THREE.Object3D;
  billboard: boolean;
  yAxisOnly: boolean;
};

export class AssetSpawner {
  private texLoader = new THREE.TextureLoader();
  private spawned: Spawned[] = [];

  constructor(
    private scene: THREE.Scene,
    private manifest: AssetManifest,
    private overrides: Overrides
  ) {}

  async spawn(id: string, kind: "enemy" | "tower", position: THREE.Vector3) {
    const asset = this.manifest.assets.find((a) => a.id === id);
    if (!asset) throw new Error(`Missing manifest asset: ${id}`);

    const ov = this.overrides[id] ?? {};
    const root = new THREE.Group();
    root.position.copy(position);

    const tex = await this.texLoader.loadAsync(asset.file);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;

    const spriteMode = ov.spriteMode ?? true;
    let visual: THREE.Object3D;

    if (spriteMode) {
      const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(2, 2, 1);
      visual = sprite;
    } else {
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const geo = new THREE.PlaneGeometry(2, 2);
      const plane = new THREE.Mesh(geo, mat);
      visual = plane;
    }

    const s = ov.scale ?? [1, 1, 1];
    const r = ov.rotation ?? [0, 0, 0];
    const o = ov.offset ?? [0, 0, 0];
    visual.scale.multiply(new THREE.Vector3(s[0], s[1], s[2]));
    visual.rotation.set(r[0], r[1], r[2]);
    visual.position.set(o[0], o[1], o[2]);

    root.add(visual);

    let healthbar: Healthbar | undefined;
    if (kind === "enemy" && (ov.healthbar?.enabled ?? true)) {
      const hb = new Healthbar(ov.healthbar?.width ?? 1.2, ov.healthbar?.height ?? 0.12);
      hb.group.position.y = ov.healthbar?.offsetY ?? 1.6;
      root.add(hb.group);
      healthbar = hb;
      hb.setPercent(1);
    }

    let iconBadge: THREE.Object3D | undefined;
    if (kind === "tower" && ov.iconBadge?.enabled) {
      const badge = await createIconBadge(ov.iconBadge.icon);
      badge.position.y = ov.iconBadge.offsetY ?? 2.2;
      badge.scale.setScalar(ov.iconBadge.scale ?? 1);
      root.add(badge);
      iconBadge = badge;
    }

    this.scene.add(root);

    const spawned: Spawned = {
      id,
      root,
      visual,
      healthbar,
      iconBadge,
      billboard: ov.billboard ?? (kind === "enemy"),
      yAxisOnly: ov.yAxisOnly ?? true
    };

    this.spawned.push(spawned);
    return spawned;
  }

  setHealth(spawned: Spawned, current: number, max: number) {
    const p = max <= 0 ? 0 : current / max;
    spawned.healthbar?.setPercent(p);
  }

  getAll() { return this.spawned; }
}
