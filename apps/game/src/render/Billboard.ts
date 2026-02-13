import * as THREE from "three";

export function applyBillboard(obj: THREE.Object3D, camera: THREE.Camera, yAxisOnly: boolean) {
  if (yAxisOnly) {
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);

    const objPos = new THREE.Vector3();
    obj.getWorldPosition(objPos);

    const dir = camPos.sub(objPos);
    dir.y = 0;
    dir.normalize();

    const yaw = Math.atan2(dir.x, dir.z);
    obj.rotation.set(0, yaw, 0);
    return;
  }
  obj.quaternion.copy(camera.quaternion);
}
