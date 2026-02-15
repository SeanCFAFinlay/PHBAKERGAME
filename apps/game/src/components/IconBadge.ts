import * as THREE from 'three';

export interface IconBadgeConfig {
  icon: string;
  scale: number;
  offsetY: number;
  outline: boolean;
  padding?: number;
}

export class IconBadge {
  private container: THREE.Group;
  private sprite: THREE.Sprite | THREE.Mesh;
  private config: IconBadgeConfig;
  private textureLoader: THREE.TextureLoader;

  constructor(config: IconBadgeConfig) {
    this.config = {
      padding: 0.1,
      ...config,
    };

    this.container = new THREE.Group();
    this.container.position.y = this.config.offsetY;
    this.textureLoader = new THREE.TextureLoader();

    // Create a sprite for the icon badge
    const spriteMaterial = new THREE.SpriteMaterial({
      map: null,
      transparent: true,
      sizeAttenuation: false, // Keep same screen size regardless of distance
    });

    this.sprite = new THREE.Sprite(spriteMaterial);
    this.sprite.scale.set(this.config.scale, this.config.scale, 1);
    this.container.add(this.sprite);

    // Load the icon texture
    this.loadIcon(this.config.icon);
  }

  private async loadIcon(iconPath: string): Promise<void> {
    try {
      const texture = await this.textureLoader.loadAsync(iconPath);
      texture.colorSpace = THREE.SRGBColorSpace;

      if (this.sprite instanceof THREE.Sprite) {
        (this.sprite.material as THREE.SpriteMaterial).map = texture;
        (this.sprite.material as THREE.SpriteMaterial).needsUpdate = true;
      }
    } catch (error) {
      console.warn(`Failed to load icon texture: ${iconPath}`, error);
      // Create a fallback colored square
      this.createFallbackIcon();
    }
  }

  private createFallbackIcon(): void {
    // Create a simple colored plane as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Draw a simple icon background
    ctx.fillStyle = '#4444ff';
    ctx.fillRect(0, 0, 64, 64);

    // Add outline if configured
    if (this.config.outline) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 60, 60);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    if (this.sprite instanceof THREE.Sprite) {
      (this.sprite.material as THREE.SpriteMaterial).map = texture;
      (this.sprite.material as THREE.SpriteMaterial).needsUpdate = true;
    }
  }

  getObject(): THREE.Group {
    return this.container;
  }

  lookAt(position: THREE.Vector3): void {
    // Sprites always face camera by default, but we can control the container
    this.container.lookAt(position);
  }

  setIcon(iconPath: string): void {
    this.config.icon = iconPath;
    this.loadIcon(iconPath);
  }

  dispose(): void {
    if (this.sprite instanceof THREE.Sprite) {
      const material = this.sprite.material as THREE.SpriteMaterial;
      if (material.map) {
        material.map.dispose();
      }
      material.dispose();
    }
    this.sprite.geometry?.dispose();
  }
}
