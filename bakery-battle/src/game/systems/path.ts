// src/game/systems/path.ts

export type Point = {
  x: number;
  y: number;
};

export function point(x: number, y: number): Point {
  return { x, y };
}

export function findPath(start: Point, end: Point): Point[] {
  const path: Point[] = [];
  let x = start.x;
  let y = start.y;

  path.push({ x, y });

  while (x !== end.x || y !== end.y) {
    if (x < end.x) x++;
    else if (x > end.x) x--;

    if (y < end.y) y++;
    else if (y > end.y) y--;

    path.push({ x, y });
  }

  return path;
}
