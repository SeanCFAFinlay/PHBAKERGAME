import * as THREE from 'three';

export type BillboardMode = 'full' | 'y-axis-only';

export class Billboard {
  private object: THREE.Object3D;
  private camera: THREE.Camera;
  private mode: BillboardMode;

  constructor(object: THREE.Object3D, camera: THREE.Camera, mode: BillboardMode = 'full') {
    this.object = object;
    this.camera = camera;
    this.mode = mode;
  }

  update(): void {
    if (this.mode === 'full') {
      // Full camera facing - object faces camera completely
      this.object.lookAt(this.camera.position);
    } else if (this.mode === 'y-axis-only') {
      // Y-axis only - object rotates around Y axis to face camera
      const cameraPosition = this.camera.position.clone();
      const objectPosition = this.object.position.clone();

      // Project to XZ plane (zero out Y)
      cameraPosition.y = objectPosition.y;

      this.object.lookAt(cameraPosition);
    }
  }

  setMode(mode: BillboardMode): void {
    this.mode = mode;
  }

  getMode(): BillboardMode {
    return this.mode;
  }
}
