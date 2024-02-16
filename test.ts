/**
 * Desmos: https://www.desmos.com/3d
 * \left(\sqrt{\left(1-\left(\frac{\operatorname{floor}\left(\frac{t}{n}\right)}{n}\ \cdot\ 2\ -\ 1\right)^{2}\ \right)}\cdot\cos\left(2\cdot\pi\cdot\frac{t}{n}\right),\ \sqrt{\left(1-\left(\frac{\operatorname{floor}\left(\frac{t}{n}\right)}{n}\ \cdot\ 2\ -\ 1\right)^{2}\ \right)}\ \cdot\ \sin\left(2\cdot\pi\cdot\frac{t}{n}\right),\ \frac{\operatorname{floor}\left(\frac{t}{n}\right)}{n}\ \cdot\ 2\ -\ 1\right)
 *
 * n=100
 */

import { Vec3 } from "./ui";

let a = new Uint32Array(1);
let v = new Uint32Array(1)[0];
a[0] = 0xffffffff;
a[0] += 1;
console.log(a[0]);

let t = v + 1;
console.log(t);

console.log(0xffffffff);

const pi2 = Math.PI * 2;
const pi_2 = Math.PI / 2;

// Precision

/**
 * Converts from the parametric representation of the angle to Euler angles.
 *
 * b is the two (but combined) unsigned integers that represents the angle
 *
 * n is the precision used (the max value of the bits used for the angle)
 */
function toEuler(b: Uint32Array, n: number): Vec3 {
  const t = 0x0000000000000000 | (b[1] << 32) | b[0];
  const dn = 1 / n;
  const dt = t * dn;
  const z = Math.floor(dt) * dn * 2 - 1;
  const r = Math.sqrt(1 - z * z);

  const x = r * Math.cos(pi2 * dt);
  const y = r * Math.sin(pi2 * dt);

  return [x, y, z];
}

const n32: number = 0xffffffff;
const n32_2: number = Math.floor(n32 / 2);
const n32_pi_2: number = n32 * pi_2;
const dn32: number = 1 / n32;

/**
 * Converts from the parametric representation of the angle to Euler angles.
 *
 * b is the two (but combined) 32 bit unsigned integers that represents the
 * angle
 */
function bit32toEuler(b: Uint32Array): Vec3 {
  const t = 0x0000000000000000 | (b[1] << 32) | b[0];
  const dt = t * dn32;
  const z = Math.floor(dt) * dn32 * 2 - 1;
  const r = Math.sqrt(1 - z * z);

  const x = r * Math.cos(pi2 * dt);
  const y = r * Math.sin(pi2 * dt);

  return [x, y, z];
}

/**
 * This converts an Euler angle to it's parametric representation.
 */
function toParametric32(v: Vec3) {
  let t = new Uint32Array(2);
  t[0] += Math.floor((v[2] + 1) * n32_2);
  t[1] += Math.floor(Math.atan2(v[1], v[0]) * n32_pi_2);
}
