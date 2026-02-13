import * as THREE from 'three';

export interface HealthbarConfig {
  width: number;
  height: number;
  offsetY: number;
  color?: string;
  backgroundColor?: string;
}

export class Healthbar {
  private container: THREE.Group;
  private bar: THREE.Mesh;
  private background: THREE.Mesh;
  private config: HealthbarConfig;
  private currentHealth: number = 1.0;

  constructor(config: HealthbarConfig) {
    this.config = {
      color: '#ef4444',
      backgroundColor: '#222222',
      ...config,
    };

    this.container = new THREE.Group();
    this.container.position.y = this.config.offsetY;

    // Background bar (dark)
    const bgGeometry = new THREE.PlaneGeometry(this.config.width, this.config.height);
    const bgMaterial = new THREE.MeshBasicMaterial({
      color: this.config.backgroundColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    this.background = new THREE.Mesh(bgGeometry, bgMaterial);
    this.container.add(this.background);

    // Health bar (red)
    const barGeometry = new THREE.PlaneGeometry(this.config.width, this.config.height);
    const barMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      side: THREE.DoubleSide,
    });
    this.bar = new THREE.Mesh(barGeometry, barMaterial);
    this.bar.position.z = 0.001; // Slightly in front of background
    this.container.add(this.bar);
  }

  setHealth(healthPercent: number): void {
    this.currentHealth = Math.max(0, Math.min(1, healthPercent));
    
    // Scale the bar horizontally based on health
    this.bar.scale.x = this.currentHealth;
    
    // Adjust position to keep left-aligned
    const offset = (this.config.width * (1 - this.currentHealth)) / 2;
    this.bar.position.x = -offset;
  }

  getHealth(): number {
    return this.currentHealth;
  }

  getObject(): THREE.Group {
    return this.container;
  }

  lookAt(position: THREE.Vector3): void {
    this.container.lookAt(position);
  }

  dispose(): void {
    this.background.geometry.dispose();
    (this.background.material as THREE.Material).dispose();
    this.bar.geometry.dispose();
    (this.bar.material as THREE.Material).dispose();
  }
}
