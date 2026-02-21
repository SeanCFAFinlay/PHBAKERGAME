import { GameRenderer } from './core/GameRenderer';
import * as THREE from 'three';
import { Billboard } from './components/Billboard';
import { Healthbar } from './components/Healthbar';
import { IconBadge } from './components/IconBadge';

class Game {
  private renderer: GameRenderer;
  private billboards: Billboard[] = [];
  private debugMode = false;

  constructor() {
    const app = document.getElementById('app');
    if (!app) {
      throw new Error('App container not found');
    }

    this.renderer = new GameRenderer({
      container: app,
      enableShadows: true,
      enableStats: true,
    });

    this.setupScene();
    this.setupKeyboardControls();
    this.renderer.start();
  }

  private setupScene(): void {
    // Add a ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b2a1f,
      roughness: 0.8,
      metalness: 0.2,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.renderer.scene.add(ground);

    // Demo: Add an enemy with billboard and healthbar
    this.addDemoEnemy(new THREE.Vector3(-3, 0.5, 0));

    // Demo: Add a tower with icon badge
    this.addDemoTower(new THREE.Vector3(3, 0, 0));

    // Add update callback for billboards
    this.renderer.addUpdateCallback(() => {
      this.updateBillboards();
    });
  }

  private addDemoEnemy(position: THREE.Vector3): void {
    // Create a simple cube as enemy placeholder
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0xff6666,
      roughness: 0.5,
      metalness: 0.5,
    });
    const enemy = new THREE.Mesh(geometry, material);
    enemy.position.copy(position);
    enemy.castShadow = true;
    this.renderer.scene.add(enemy);

    // Add billboard behavior to enemy
    const billboard = new Billboard(enemy, this.renderer.camera, 'full');
    this.billboards.push(billboard);

    // Add healthbar
    const healthbar = new Healthbar({
      width: 1.0,
      height: 0.15,
      offsetY: 1.0,
    });
    healthbar.setHealth(0.7); // 70% health
    enemy.add(healthbar.getObject());

    // Make healthbar also billboard
    const healthbarBillboard = new Billboard(healthbar.getObject(), this.renderer.camera, 'full');
    this.billboards.push(healthbarBillboard);
  }

  private addDemoTower(position: THREE.Vector3): void {
    // Create a simple tower
    const geometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4488ff,
      roughness: 0.6,
      metalness: 0.4,
    });
    const tower = new THREE.Mesh(geometry, material);
    tower.position.copy(position);
    tower.position.y = 1;
    tower.castShadow = true;
    this.renderer.scene.add(tower);

    // Add icon badge
    const iconBadge = new IconBadge({
      icon: '/assets/icons/tower_icon.png',
      scale: 0.3,
      offsetY: 2.5,
      outline: true,
    });
    tower.add(iconBadge.getObject());

    // Make icon badge billboard
    const badgeBillboard = new Billboard(iconBadge.getObject(), this.renderer.camera, 'full');
    this.billboards.push(badgeBillboard);
  }

  private updateBillboards(): void {
    this.billboards.forEach((billboard) => {
      billboard.update();
    });
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (event) => {
      switch (event.key.toLowerCase()) {
        case 'd':
          this.debugMode = !this.debugMode;
          console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`);
          break;
        case 'b':
          console.log('Toggle bounding boxes');
          // TODO: Implement bounding box visualization
          break;
        case 'h':
          console.log('Toggle hitboxes');
          // TODO: Implement hitbox visualization
          break;
        case 'l':
          console.log('Toggle LOD rings');
          // TODO: Implement LOD ring visualization
          break;
      }
    });
  }
}

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
