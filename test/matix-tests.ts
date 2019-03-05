import {
  multiply4x4,
  multiply4x4by4,
  rotationEuler4x4,
  translation4x4
} from "../src/voidgl/util/matrix";
import { Vec4 } from "../src/voidgl/util/vector";

function compare4(a: Vec4, b: Vec4): boolean {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001 &&
    Math.abs(a[3] - b[3]) < 0.0001
  );
}

export function matrix_test() {
  const point: Vec4 = [0, 0, 0, 1];
  const transform = multiply4x4(
    rotationEuler4x4(0, Math.PI, 0),
    translation4x4(1, 0, 0)
  );
  const check = multiply4x4by4(transform, point);
  if (!compare4(check, [-1, 0, 0, 1.0])) {
    console.warn("FAILED MATRIX MATH");
  }
}
