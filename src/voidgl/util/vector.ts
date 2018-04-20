const { sqrt } = Math;

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Vec4 = [number, number, number, number];

export function add2(left: Vec2, right: Vec2): Vec2 {
  return [
    left[0] + right[0],
    left[1] + right[1],
  ];
}

export function scale2(left: Vec2, scale: number): Vec2 {
  return [
    left[0] * scale,
    left[1] * scale,
  ];
}

export function subtract2(left: Vec2, right: Vec2): Vec2 {
  return [
    left[0] - right[0],
    left[1] - right[1],
  ];
}

export function multiply2(left: Vec2, right: Vec2): Vec2 {
  return [
    left[0] * right[0],
    left[1] * right[1],
  ];
}

export function dot2(left: Vec2, right: Vec2): number {
  return (
    left[0] * right[0] +
    left[1] * right[1]
  );
}

export function linear2(start: Vec2, end: Vec2, t: number): Vec2 {
  return scale2(add2(subtract2(end, start), start), t);
}

export function length2(start: Vec2): number {
  return sqrt(dot2(start, start));
}

export function add3(left: Vec3, right: Vec3): Vec3 {
  return [
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
  ];
}

export function scale3(left: Vec3, scale: number): Vec3 {
  return [
    left[0] * scale,
    left[1] * scale,
    left[2] * scale,
  ];
}

export function subtract3(left: Vec3, right: Vec3): Vec3 {
  return [
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2],
  ];
}

export function multiply3(left: Vec3, right: Vec3): Vec3 {
  return [
    left[0] * right[0],
    left[1] * right[1],
    left[2] * right[2],
  ];
}

export function linear3(start: Vec3, end: Vec3, t: number): Vec3 {
  return scale3(add3(subtract3(end, start), start), t);
}

export function length3(start: Vec3): number {
  return sqrt(dot3(start, start));
}

export function dot3(left: Vec3, right: Vec3): number {
  return (
    left[0] * right[0] +
    left[1] * right[1] +
    left[2] * right[2]
  );
}

export function add4(left: Vec4, right: Vec4): Vec4 {
  return [
    left[0] + right[0],
    left[1] + right[1],
    left[2] + right[2],
    left[3] + right[3],
  ];
}

export function scale4(left: Vec4, scale: number): Vec4 {
  return [
    left[0] * scale,
    left[1] * scale,
    left[2] * scale,
    left[3] * scale,
  ];
}

export function subtract4(left: Vec4, right: Vec4): Vec4 {
  return [
    left[0] - right[0],
    left[1] - right[1],
    left[2] - right[2],
    left[3] - right[3],
  ];
}

export function multiply4(left: Vec4, right: Vec4): Vec4 {
  return [
    left[0] * right[0],
    left[1] * right[1],
    left[2] * right[2],
    left[3] * right[3],
  ];
}

export function dot4(left: Vec4, right: Vec4): number {
  return (
    left[0] * right[0] +
    left[1] * right[1] +
    left[2] * right[2] +
    left[3] * right[3]
  );
}

export function linear4(start: Vec4, end: Vec4, t: number): Vec4 {
  return scale4(add4(subtract4(end, start), start), t);
}

export function length4(start: Vec4): number {
  return sqrt(dot4(start, start));
}
