export type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export function makeProjectile(x: number, y: number, tx: number, ty: number): Projectile {
  const dx = tx - x;
  const dy = ty - y;
  const d = Math.hypot(dx, dy) || 1;
  const speed = 420;
  return { x, y, vx: (dx / d) * speed, vy: (dy / d) * speed, life: 0.7 };
}
