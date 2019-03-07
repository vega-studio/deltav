import {
  add3x3,
  add4x4,
  affineInverse2x2,
  affineInverse3x3,
  affineInverse4x4,
  determinant2x2,
  determinant3x3,
  determinant4x4,
  Mat2x2,
  Mat3x3,
  Mat4x4,
  multiply3x3,
  multiply3x3by3,
  multiply4x4,
  multiply4x4by4,
  rotationEuler3x3,
  rotationEuler4x4,
  scale3x3,
  scale3x3by2,
  scale4x4,
  scale4x4by3,
  subtract3x3,
  subtract4x4,
  translation3x3,
  translation3x3by2,
  translation4x4,
  translation4x4by3
} from "../src/voidgl/util/matrix";
import { Vec3, Vec4 } from "../src/voidgl/util/vector";

function compare3(a: Vec3, b: Vec3): boolean {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001
  );
}

function compare4(a: Vec4, b: Vec4): boolean {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001 &&
    Math.abs(a[3] - b[3]) < 0.0001
  );
}

function compare2x2(a: Mat2x2, b: Mat2x2): boolean {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001 &&
    Math.abs(a[3] - b[3]) < 0.0001
  );
}

function compare3x3(a: Mat3x3, b: Mat3x3): boolean {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001 &&
    Math.abs(a[3] - b[3]) < 0.0001 &&
    Math.abs(a[4] - b[4]) < 0.0001 &&
    Math.abs(a[5] - b[5]) < 0.0001 &&
    Math.abs(a[6] - b[6]) < 0.0001 &&
    Math.abs(a[7] - b[7]) < 0.0001 &&
    Math.abs(a[8] - b[8]) < 0.0001
  );
}

function compare4x4(a: Mat4x4, b: Mat4x4): boolean {
  return (
    Math.abs(a[0] - b[0]) < 0.0001 &&
    Math.abs(a[1] - b[1]) < 0.0001 &&
    Math.abs(a[2] - b[2]) < 0.0001 &&
    Math.abs(a[3] - b[3]) < 0.0001 &&
    Math.abs(a[4] - b[4]) < 0.0001 &&
    Math.abs(a[5] - b[5]) < 0.0001 &&
    Math.abs(a[6] - b[6]) < 0.0001 &&
    Math.abs(a[7] - b[7]) < 0.0001 &&
    Math.abs(a[8] - b[8]) < 0.0001 &&
    Math.abs(a[9] - b[9]) < 0.0001 &&
    Math.abs(a[10] - b[10]) < 0.0001 &&
    Math.abs(a[11] - b[11]) < 0.0001 &&
    Math.abs(a[12] - b[12]) < 0.0001 &&
    Math.abs(a[13] - b[13]) < 0.0001 &&
    Math.abs(a[14] - b[14]) < 0.0001 &&
    Math.abs(a[15] - b[15]) < 0.0001
  );
}

export function matrix_test() {
  add_sub_test();
  inverse_test();
  determinant_test();
  scale_test();
  translation_test();
  rotation4x4_test();
  rotation3x3_test();
}

function add_sub_test() {
  const a: Mat3x3 = [1, 2, 1, 5, 2, 9, 4, 7, 1];
  const b: Mat3x3 = [3, 1, 20, 10, 2, 17, 30, 6, 5];

  const check1 = add3x3(a, b);
  if (!compare3x3(check1, [4, 3, 21, 15, 4, 26, 34, 13, 6])) {
    console.warn("FAILED MAT3x3 ADD");
  }
  const check2 = subtract3x3(a, b);
  if (!compare3x3(check2, [-2, 1, -19, -5, 0, -8, -26, 1, -4])) {
    console.warn("FAILED MAT3x3 SUBSTRACT");
  }

  const c: Mat4x4 = [23, 45, 1, 7, 19, 3, 23, 5, 11, 32, 46, 3, 32, 4, 32, 67];
  const d: Mat4x4 = [2, 5, 13, 73, 9, 33, 21, 53, 1, 3, 6, 23, 31, 4, 56, 11];

  const check3 = add4x4(c, d);
  if (
    !compare4x4(check3, [
      25,
      50,
      14,
      80,
      28,
      36,
      44,
      58,
      12,
      35,
      52,
      26,
      63,
      8,
      88,
      78
    ])
  ) {
    console.warn("FAILED MAT4x4 ADD");
  }

  const check4 = subtract4x4(c, d);
  if (
    !compare4x4(check4, [
      21,
      40,
      -12,
      -66,
      10,
      -30,
      2,
      -48,
      10,
      29,
      40,
      -20,
      1,
      0,
      -24,
      56
    ])
  ) {
    console.warn("FAILED MAT4x4 SUBSTRACT");
    console.warn(check4);
  }
}

function inverse_test() {
  const a: Mat2x2 = [4, 7, 2, 6];
  const check1 = affineInverse2x2(a);
  if (check1 && !compare2x2(check1, [0.6, -0.7, -0.2, 0.4])) {
    console.warn("FAILED MAT2x2 INVERSE");
  }

  const b: Mat3x3 = [2, 3, 5, 4, 1, 6, 1, 3, 0];
  const check2 = affineInverse3x3(b);
  if (
    check2 &&
    !compare3x3(check2, [
      -18 / 37,
      15 / 37,
      13 / 37,
      6 / 37,
      -5 / 37,
      8 / 37,
      11 / 37,
      -3 / 37,
      -10 / 37
    ])
  ) {
    console.warn("FAILED MAT3x3 INVERSE");
  }

  const c: Mat4x4 = [1, 2, 3, 4, 0, 5, 7, 9, -2, 4, -8, 5, 10, 6, 6, 7];
  const check3 = affineInverse4x4(c);
  if (
    check3 &&
    !compare4x4(check3, [
      0.47934,
      -0.25207,
      -0.00207,
      0.05165,
      -2.19008,
      0.78099,
      0.03099,
      0.22521,
      -0.30579,
      0.16942,
      -0.08058,
      0.01446,
      1.45455,
      -0.45455,
      0.04545,
      -0.13636
    ])
  ) {
    console.warn("FAILED MAT4x4 INVERSE");
  }
}

function determinant_test() {
  const a = determinant2x2([1, 2, 3, 4]);
  if (Math.abs(a - -2) > 0.0001) {
    console.warn("FAILED DETERMINANT MAT2x2");
  }

  const b = determinant3x3([2, -3, 1, 2, 0, -1, 1, 4, 5]);
  if (Math.abs(b - 49) > 0.0001) {
    console.warn("FAILED DETERMINANT MAT3x3");
  }

  const c = determinant4x4([3, 2, -1, 4, 2, 1, 5, 7, 0, 5, 2, -6, -1, 2, 1, 0]);
  if (Math.abs(c - -418) > 0.0001) {
    console.warn("FAILED DETERMINANT MAT4x4");
  }
}

function scale_test() {
  const point1: Vec3 = [1, 2, 1];

  const check1 = multiply3x3by3(scale3x3(3, 4), point1);
  if (!compare3(check1, [3, 8, 1])) {
    console.warn("FAILED SCALE3x3");
  }

  const check2 = multiply3x3by3(scale3x3by2([6, 7]), point1);
  if (!compare3(check2, [6, 14, 1])) {
    console.warn("FAILED SCALE3x3BY2");
  }

  const point2: Vec4 = [1, 2, 3, 1];

  const check3 = multiply4x4by4(scale4x4(4, 5, 6), point2);
  if (!compare4(check3, [4, 10, 18, 1])) {
    console.warn("FAILED SCALE4x4");
  }

  const check4 = multiply4x4by4(scale4x4by3([6, 7, 8]), point2);
  if (!compare4(check4, [6, 14, 24, 1])) {
    console.warn("FAILED SCALE4x4BY3");
  }
}

function translation_test() {
  const point1: Vec3 = [1, 2, 1];
  const check1 = multiply3x3by3(translation3x3(3, 4), point1);
  if (!compare3(check1, [4, 6, 1])) {
    console.warn("FAILED TRANSLATION3x3");
  }

  const check2 = multiply3x3by3(translation3x3by2([7, 9]), point1);
  if (!compare3(check2, [8, 11, 1])) {
    console.warn("FAILED TRANSLATION3x3BY2");
  }

  const point2: Vec4 = [1, 2, 3, 1];

  const check3 = multiply4x4by4(translation4x4(8, 9, 11), point2);
  if (!compare4(check3, [9, 11, 14, 1])) {
    console.warn("FAILED TRANSLATION4x4");
  }

  const check4 = multiply4x4by4(translation4x4by3([3, 5, 8]), point2);
  if (!compare4(check4, [4, 7, 11, 1])) {
    console.warn("FAILED TRANSLATION4x4BY3");
  }
}

function rotation4x4_test() {
  const point: Vec4 = [0, 0, 0, 1];

  const transform1 = multiply4x4(
    rotationEuler4x4(0, Math.PI / 2, 0),
    translation4x4(1, 0, 0)
  );
  const check1 = multiply4x4by4(transform1, point);
  if (!compare4(check1, [0, 0, 1, 1.0])) {
    console.warn("FAILED ROTATIONEULER AROUND Y 4x4");
  }

  const transform2 = multiply4x4(
    rotationEuler4x4(Math.PI / 2, 0, 0),
    translation4x4(1, 1, 0)
  );
  const check2 = multiply4x4by4(transform2, point);
  if (!compare4(check2, [1, 0, -1, 1.0])) {
    console.warn("FAILED ROTATIONEULER AROUND X 4x4");
  }

  const transform3 = multiply4x4(
    rotationEuler4x4(0, 0, Math.PI / 2),
    translation4x4(1, 1, 0)
  );
  const check3 = multiply4x4by4(transform3, point);
  if (!compare4(check3, [1, -1, 0, 1])) {
    console.warn("FAILED ROTATIONEULER AROUND Z 4x4");
  }

  const transform4 = multiply4x4(
    rotationEuler4x4(0, Math.PI, Math.PI / 2),
    translation4x4(1, 0, 0)
  );
  const check4 = multiply4x4by4(transform4, point);
  if (!compare4(check4, [0, 1, 0, 1])) {
    console.warn(
      "FAILED: rotate around y by Pi, then rotate around z by Pi / 2 4x4"
    );
  }

  const transform5 = multiply4x4(
    rotationEuler4x4(Math.PI, 0, Math.PI / 2),
    translation4x4(0, 1, 0)
  );
  const check5 = multiply4x4by4(transform5, point);
  if (!compare4(check5, [-1, 0, 0, 1])) {
    console.warn(
      "FAILED: rotate around x by Pi, then rotate around z by Pi / 2 4x4"
    );
  }

  const transform6 = multiply4x4(
    rotationEuler4x4(Math.PI / 2, Math.PI / 2, 0),
    translation4x4(1, 1, 0)
  );

  const check6 = multiply4x4by4(transform6, point);
  if (!compare4(check6, [1, 0, 1, 1])) {
    console.warn(
      "FAILED: rotate around x by Pi / 2, y by Pi / 2, z by Pi / 2 4x4"
    );
  }

  const transform7 = multiply4x4(
    rotationEuler4x4(Math.PI / 4, 0, Math.PI / 4),
    translation4x4(0, 1, 0)
  );

  const check7 = multiply4x4by4(transform7, point);
  if (!compare4(check7, [1 / 2, 1 / 2, -Math.sqrt(2) / 2, 1])) {
    console.warn(
      "FAILED: rotate around x by Pi / 4, then rotate around z by Pi / 4 4x4"
    );
  }

  const transform8 = multiply4x4(
    rotationEuler4x4(Math.PI / 2, Math.PI / 2, Math.PI / 2),
    translation4x4(1, 1, 1)
  );

  const check8 = multiply4x4by4(transform8, point);
  if (!compare4(check8, [1, -1, 1, 1])) {
    console.warn(
      "FAILED: rotate around x by Pi / 2, y by Pi / 2, z by Pi / 2 4x4"
    );
  }
}

function rotation3x3_test() {
  const point: Vec3 = [0, 0, 1];

  const transform1 = multiply3x3(
    rotationEuler3x3(Math.PI / 2),
    translation3x3(0, 1)
  );

  const check1 = multiply3x3by3(transform1, point);
  if (!compare3(check1, [1, 0, 1])) {
    console.warn("FAILED: rotate Pi / 2 3x3");
  }

  const transform2 = multiply3x3(
    rotationEuler3x3(Math.PI / 4),
    translation3x3(0, 1)
  );

  const check2 = multiply3x3by3(transform2, point);
  if (!compare3(check2, [Math.sqrt(2) / 2, Math.sqrt(2) / 2, 1])) {
    console.warn("FAILED: rotate Pi / 4 3x3");
  }
}
