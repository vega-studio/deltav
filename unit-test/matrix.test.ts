/**
 * SOme notes to consider in many of these unit tests. These results are comapred against the results of some online
 * calculators:
 *
 * https://www.andre-gaschler.com/rotationconverter/
 * https://matrix.reshish.com/multiplication.php
 *
 * It should be noted that these calculators are row major matrix format, so you will see a lot of assertions comparing
 * against transposed results as our matrices are column major.
 */

import { describe, it } from "@jest/globals";
import assert from "assert";

import {
  apply2x2,
  apply3x3,
  apply4x4,
  compare2x2,
  compare3x3,
  compare4x4,
  concat4x4,
  copy2x2,
  copy3x3,
  copy4x4,
  identity2x2,
  identity3x3,
  identity4x4,
  Mat2x2,
  Mat3x3,
  Mat4x4,
  multiply2x2,
  multiply3x3,
  multiply4x4,
  multiplyScalar2x2,
  multiplyScalar3x3,
  multiplyScalar4x4,
  rotation4x4,
  rotation4x4by3,
  scale4x4,
  scale4x4by3,
  shearX2x2,
  shearX4x4,
  shearY2x2,
  shearY4x4,
  shearZ4x4,
  toString2x2,
  toString3x3,
  toString4x4,
  transform2,
  transform3,
  transform4,
  translation4x4,
  translation4x4by3,
  transpose2x2,
  transpose3x3,
  transpose4x4,
} from "../ui/src/math/matrix.js";
import {
  fuzzyCompare2,
  fuzzyCompare3,
  fuzzyCompare4,
  Vec2,
  Vec3,
  Vec4,
} from "../ui/src/math/vector.js";
import { fail2, fail3, fail4 } from "./vector.test.js";

function fail2x2(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString2x2(actual)},\nEXPECTED: ${toString2x2(
    expected
  )}`;
}

function fail3x3(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString3x3(actual)},\nEXPECTED: ${toString3x3(
    expected
  )}`;
}

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(
    expected
  )}`;
}

function assert2x2(actual: Mat2x2, expected: Mat2x2, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(compare2x2(actual, expected), true, fail2x2(actual, expected));
  } else {
    assert.equal(
      !compare2x2(actual, expected),
      true,
      fail2x2(actual, expected)
    );
  }
}

function assert3x3(actual: Mat3x3, expected: Mat3x3, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(compare3x3(actual, expected), true, fail3x3(actual, expected));
  } else {
    assert.equal(
      !compare3x3(actual, expected),
      true,
      fail3x3(actual, expected)
    );
  }
}

function assert4x4(actual: Mat4x4, expected: Mat4x4, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(compare4x4(actual, expected), true, fail4x4(actual, expected));
  } else {
    assert.equal(
      !compare4x4(actual, expected),
      true,
      fail4x4(actual, expected)
    );
  }
}

function assert2(actual: Vec2, expected: Vec2, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(
      fuzzyCompare2(actual, expected, 1e-7),
      true,
      fail2(actual, expected)
    );
  } else {
    assert.equal(
      !fuzzyCompare2(actual, expected, 1e-7),
      true,
      fail2(actual, expected)
    );
  }
}

function assert3(actual: Vec3, expected: Vec3, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(
      fuzzyCompare3(actual, expected, 1e-7),
      true,
      fail3(actual, expected)
    );
  } else {
    assert.equal(
      !fuzzyCompare3(actual, expected, 1e-7),
      true,
      fail3(actual, expected)
    );
  }
}

function assert4(actual: Vec4, expected: Vec4, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(
      fuzzyCompare4(actual, expected, 1e-7),
      true,
      fail4(actual, expected)
    );
  } else {
    assert.equal(
      !fuzzyCompare4(actual, expected, 1e-7),
      true,
      fail4(actual, expected)
    );
  }
}

const TO_RADIANS = Math.PI / 180;
const m4x4: Mat4x4 = identity4x4();

describe("Matrix Library", () => {
  describe("Is Column Major", () => {
    // Create a row-major translation matrix: +1 X, +2 Y, +3 Z
    const m = translation4x4(1, 2, 3);

    // Expected column-major layout (transpose of row-major)
    // prettier-ignore
    const expected = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      1, 2, 3, 1
    ];

    assert.deepEqual(m, expected);
  });

  // #region Compare
  describe("Compare", () => {
    (
      [
        [
          [1, 2, 3, 4],
          [1, 2, 3, 4],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7],
          [1, 2, 3, 4, 5, 6, 7],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7],
          [1, 2, 3, 4, 5, 8, 7],
        ],
        [
          [1, 2, 3, 4, 5],
          [1, 2, 3, 4],
        ],
        [
          [1, 2, 3 + 1e-11, 4, 5],
          [1, 2, 3, 4],
        ],
      ] as Mat2x2[][]
    ).forEach((t: Mat2x2[]) => {
      it("Compare 2x2 matrices should be true", () => {
        assert2x2(t[0], t[1]);
      });
    });

    (
      [
        [
          [1, 2, 3, 4],
          [1, 2, 0, 4],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7],
          [1, 2, -1, 4, 5, 6, 7],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7],
          [-2, 2, 3, 4, 5, 8, 7],
        ],
        [
          [1, 2, 3, 8, 5],
          [1, 2, 3, 4],
        ],
        [
          [1, 2, 3, 4.0001, 5],
          [1, 2, 3, 4],
        ],
      ] as Mat2x2[][]
    ).forEach((t: Mat2x2[]) => {
      it("Compare 2x2 matrices should be false", () => {
        assert2x2(t[0], t[1], false);
      });
    });

    (
      [
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 11],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6 + 1e-11, 7, 8, 9],
        ],
      ] as Mat3x3[][]
    ).forEach((t: Mat3x3[]) => {
      it("Compare 3x3 matrices should be true", () => {
        assert3x3(t[0], t[1]);
      });
    });

    (
      [
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [0, 2, 3, 4, 5, 6, 7, 8, 9],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 2, 6, 7, 8, 9],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9],
          [1, 2, 3, 4, 5, 6, 7, 8, 89],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          [1, 2, 3, 4, 5, 6, 7, 8, 1, 10, 11],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          [1, 2, 3, 4, 5, 6, 7, 8, 1, 11, 11],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          [1, 2, 3, 4, 5, 6, 7, 8, 9 + 1e-6, 10, 11],
        ],
      ] as Mat3x3[][]
    ).forEach((t: Mat3x3[]) => {
      it("Compare 3x3 matrices should be false", () => {
        assert3x3(t[0], t[1], false);
      });
    });

    (
      [
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        ],
        [
          [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20,
          ],
          [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 19,
            20,
          ],
        ],
        [
          [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20,
          ],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 + 1e-11, 12, 13, 14, 15, 16],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        ],
      ] as Mat4x4[][]
    ).forEach((t: Mat4x4[]) => {
      it("Compare 4x4 matrices should be true", () => {
        assert4x4(t[0], t[1]);
      });
    });

    (
      [
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          [1, 2, 3, 4, 5, 6, 7, 8, 0, 10, 11, 12, 13, 14, 15, 16],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
          [1, 2, 3, 4, 5, 6, 0, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
          [1, 2, 3, 4, 5, 6, 0, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        ],
        [
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 + 1e-6, 12, 13, 14, 15, 16],
        ],
      ] as Mat4x4[][]
    ).forEach((t: Mat4x4[]) => {
      it("Compare 4x4 matrices should be false", () => {
        assert4x4(t[0], t[1], false);
      });
    });
  });
  // #endregion

  // #region Apply
  describe("Apply", () => {
    [
      [1, 2, 3, 4],
      [-1, 2, 3, 4],
      [1, 2, 3, 4, 5, 6],
    ].forEach((t) => {
      it("Should apply to 2x2 matrix", () => {
        const m: Mat2x2 = [0, 0, 0, 0];
        apply2x2(m, t[0], t[1], t[2], t[3]);
        assert2x2(m, t.slice(0, 4) as Mat2x2);
        assert.equal(m.length, 4);
      });
    });

    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [-1, 2, 3, 4, 9, 8, 7, 6, 5],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    ].forEach((t) => {
      it("Should apply to 3x3 matrix", () => {
        const m: Mat3x3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        apply3x3(m, t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]);
        assert3x3(m, t.slice(0, 9) as Mat3x3);
        assert.equal(m.length, 9);
      });
    });

    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      [-1, 2, 3, 4, 9, 8, 7, 6, 5, 10, 11, 12, 13, 14, 15, 16],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    ].forEach((t) => {
      it("Should apply to 4x4 matrix", () => {
        const m: Mat4x4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        apply4x4(
          m,
          t[0],
          t[1],
          t[2],
          t[3],
          t[4],
          t[5],
          t[6],
          t[7],
          t[8],
          t[9],
          t[10],
          t[11],
          t[12],
          t[13],
          t[14],
          t[15]
        );
        assert4x4(m, t.slice(0, 16) as Mat4x4);
        assert.equal(m.length, 16);
      });
    });
  });
  // #endregion

  describe("Identity", () => {
    it("Should make identity 2x2", () => {
      const m = identity2x2();
      assert2x2(m, [1, 0, 0, 1]);
    });

    it("Should modify to identity 2x2", () => {
      const m: Mat2x2 = [9, 9, 9, 9];
      identity2x2(m);
      assert2x2(m, [1, 0, 0, 1]);
    });

    it("Should make identity 3x3", () => {
      const m = identity3x3();
      assert3x3(m, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    });

    it("Should modify to identity 3x3", () => {
      const m: Mat3x3 = [9, 9, 9, 9, 9, 9, 9, 9, 9];
      identity3x3(m);
      assert3x3(m, [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    });

    it("Should make identity 4x4", () => {
      const m = identity4x4();
      assert4x4(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });

    it("Should modify to identity 4x4", () => {
      const m: Mat4x4 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
      identity4x4(m);
      assert4x4(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });
  });

  describe("Transpose", () => {
    it("Should transpose 2x2 matrix", () => {
      const m = transpose2x2([1, 2, 3, 4]);

      assert2x2(m, [1, 3, 2, 4]);
    });

    it("Should convert to a transposed 2x2 matrix", () => {
      const m: Mat2x2 = [1, 2, 3, 4];
      transpose2x2(m, m);

      assert2x2(m, [1, 3, 2, 4]);
    });

    it("Should transpose 3x3 matrix", () => {
      const m = transpose3x3([1, 2, 3, 4, 5, 6, 7, 8, 9]);

      assert3x3(m, [1, 4, 7, 2, 5, 8, 3, 6, 9]);
    });

    it("Should convert to a transposed 3x3 matrix", () => {
      const m: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      transpose3x3(m, m);

      assert3x3(m, [1, 4, 7, 2, 5, 8, 3, 6, 9]);
    });

    it("Should transpose 4x4 matrix", () => {
      const m = transpose4x4([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ]);

      assert4x4(m, [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);
    });

    it("Should convert to a transposed 4x4 matrix", () => {
      const m: Mat4x4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      transpose4x4(m, m);

      assert4x4(m, [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16]);
    });
  });

  describe("Translation", () => {
    it("Should create a 4x4 translation marix", () => {
      const m = translation4x4(1, 2, 3);
      assert4x4(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
    });

    it("Should modify to become a 4x4 translation marix", () => {
      const m = identity4x4();
      translation4x4(1, 2, 3, m);
      assert4x4(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
    });

    it("Should create a 4x4 translation marix from a Vec3", () => {
      const v: Vec3 = [1, 2, 3];
      const m = translation4x4by3(v);
      assert4x4(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
    });

    it("Should modify to become 4x4 translation marix from a Vec3", () => {
      const v: Vec3 = [1, 2, 3];
      const m = identity4x4();
      translation4x4by3(v, m);
      assert4x4(m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
    });
  });

  describe("Scale", () => {
    it("Should create a 4x4 scale marix", () => {
      const m = scale4x4(1, 2, 3);

      assert4x4(m, [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1]);
    });

    it("Should modify to become a 4x4 scale marix", () => {
      const m = identity4x4();
      scale4x4(1, 2, 3, m);

      assert4x4(m, [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1]);
    });

    it("Should create a 4x4 scale marix from a Vec3", () => {
      const v: Vec3 = [1, 2, 3];
      const m = scale4x4by3(v);

      assert4x4(m, [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1]);
    });

    it("Should modify to become 4x4 scale marix from a Vec3", () => {
      const v: Vec3 = [1, 2, 3];
      const m = identity4x4();
      scale4x4by3(v, m);
      assert4x4(m, [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1]);
    });
  });

  describe("Rotation (Right hand rule)", () => {
    // #region 0 degrees (Identity)
    it("Should produce an identity matrix", () => {
      const m = rotation4x4(0, 0, 0);
      assert4x4(m, identity4x4());
    });

    it("Should modify to become an identity matrix", () => {
      const m: Mat4x4 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
      rotation4x4(0, 0, 0, m);
      assert4x4(m, identity4x4());
    });

    it("Should produce an identity matrix from Vec3", () => {
      const m = rotation4x4by3([0, 0, 0]);
      assert4x4(m, identity4x4());
    });

    it("Should modify to become an identity matrix from Vec3", () => {
      const m: Mat4x4 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
      rotation4x4by3([0, 0, 0], m);
      assert4x4(m, identity4x4());
    });
    // #endregion

    // #region arbitrary greater than 360 degrees
    it("Should be a 491 degree rotation about the x-axis", () => {
      const m = rotation4x4(491 * TO_RADIANS, 0, 0);

      assert4x4(
        m,
        transpose4x4([
          1.0, 0.0, 0.0, 0, 0.0, -0.656059, -0.7547096, 0, 0.0, 0.7547096,
          -0.656059, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should modify to a 491 degree rotation about the x-axis", () => {
      rotation4x4(491 * TO_RADIANS, 0, 0, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([
          1.0, 0.0, 0.0, 0, 0.0, -0.656059, -0.7547096, 0, 0.0, 0.7547096,
          -0.656059, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should be a 491 degree rotation about the y-axis", () => {
      const m = rotation4x4(0, 491 * TO_RADIANS, 0);

      assert4x4(
        m,
        transpose4x4([
          -0.656059, 0.0, 0.7547096, 0, 0.0, 1.0, 0.0, 0, -0.7547096, 0.0,
          -0.656059, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should modify to a 491 degree rotation about the y-axis", () => {
      rotation4x4(0, 491 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([
          -0.656059, 0.0, 0.7547096, 0, 0.0, 1.0, 0.0, 0, -0.7547096, 0.0,
          -0.656059, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should be a 491 degree rotation about the z-axis", () => {
      const m = rotation4x4(0, 0, 491 * TO_RADIANS);

      assert4x4(
        m,
        transpose4x4([
          -0.656059, -0.7547096, 0.0, 0, 0.7547096, -0.656059, 0.0, 0, 0.0, 0.0,
          1.0, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should modify to a 491 degree rotation about the z-axis", () => {
      rotation4x4(0, 0, 491 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([
          -0.656059, -0.7547096, 0.0, 0, 0.7547096, -0.656059, 0.0, 0, 0.0, 0.0,
          1.0, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should be a 491 degree rotation about the xy-axis", () => {
      const m = rotation4x4(491 * TO_RADIANS, 491 * TO_RADIANS, 0);

      assert4x4(
        m,
        transpose4x4([
          -0.656059, 0.5695866, -0.495134, 0, 0.0, -0.656059, -0.7547096, 0,
          -0.7547096, -0.495134, 0.4304135, 0, 0, 0, 0, 1,
        ])
      );

      /*-0.6560590,  0.0000000,  0.7547096, 0,
        0.5695866, -0.6560590,  0.4951340, 0,
        0.4951340,  0.7547096,  0.4304135, 0,
        0, 0, 0, 1 */
    });

    it("Should modify to a 491 degree rotation about the xy-axis", () => {
      rotation4x4(491 * TO_RADIANS, 491 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([
          -0.6560590289905069, 0.5695865504800333, -0.4951340343707851, 0, 0,
          -0.6560590289905069, -0.7547095802227723, 0, -0.7547095802227723,
          -0.4951340343707851, 0.43041344951996685, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should be a 491 degree rotation about the xz-axis", () => {
      const m = rotation4x4(491 * TO_RADIANS, 0, 491 * TO_RADIANS);

      assert4x4(
        m,
        transpose4x4([
          -0.656059, 0.495134, 0.5695865, 0, 0.7547096, 0.4304134, 0.495134, 0,
          0.0, 0.7547096, -0.656059, 0, 0, 0, 0, 1,
        ])
      );
      /*-0.6560590, -0.7547096, -0.0000000, 0,
        -0.4951340,  0.4304135, -0.7547096, 0,
        0.5695866, -0.4951340, -0.6560590, 0,
        0, 0, 0, 1*/
    });

    it("Should modify a 491 degree rotation about the xz-axis", () => {
      rotation4x4(491 * TO_RADIANS, 0, 491 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([
          -0.656059, 0.495134, 0.5695865, 0, 0.7547096, 0.4304134, 0.495134, 0,
          0.0, 0.7547096, -0.656059, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should be a 491 degree rotation about the yz-axis", () => {
      const m = rotation4x4(0, 491 * TO_RADIANS, 491 * TO_RADIANS);

      assert4x4(
        m,
        transpose4x4([
          0.4304135, -0.7547096, -0.495134, 0, -0.495134, -0.656059, 0.5695866,
          0, -0.7547096, -0.0, -0.656059, 0, 0, 0, 0, 1,
        ])
      );

      /** 0.4304135,  0.4951340,  0.7547096, 0,
        0.7547096, -0.6560590, -0.0000000, 0,
        0.4951340,  0.5695866, -0.6560590, 0,
        0, 0, 0, 1*/
    });

    it("Should modify to a 491 degree rotation about the yz-axis", () => {
      rotation4x4(0, 491 * TO_RADIANS, 491 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([
          0.4304135, -0.7547096, -0.495134, 0, -0.495134, -0.656059, 0.5695866,
          0, -0.7547096, -0.0, -0.656059, 0, 0, 0, 0, 1,
        ])
      );
    });

    it("Should be a 491 degree rotation about the xyz-axis", () => {
      const m = rotation4x4(
        491 * TO_RADIANS,
        491 * TO_RADIANS,
        491 * TO_RADIANS
      );

      assert4x4(
        m,
        transpose4x4([
          0.4304134,
          0.1214516,
          0.8944237,
          0, // -0.8688164, 0.2447494, 0,
          -0.495134,
          0.8602859,
          0.1214516,
          0, // 0.0005410, -0.8688164, 0,
          -0.7547096,
          -0.495134,
          0.4304134,
          0,
          0,
          0,
          0,
          1,
        ])
      );
    });

    it("Should modify a 491 degree rotation about the xyz-axis", () => {
      rotation4x4(491 * TO_RADIANS, 491 * TO_RADIANS, 491 * TO_RADIANS, m4x4);
      assert4x4(
        m4x4,
        transpose4x4([
          0.4304134,
          0.1214516,
          0.8944237,
          0, // -0.8688164, 0.2447494, 0,
          -0.495134,
          0.8602859,
          0.1214516,
          0, // 0.0005410, -0.8688164, 0,
          -0.7547096,
          -0.495134,
          0.4304134,
          0,
          0,
          0,
          0,
          1,
        ])
      );

      /** 0.4304135,  0.4951340,  0.7547096, 0,
        -0.8688164,  0.0005410,  0.4951340, 0,
        0.2447494, -0.8688164,  0.4304135, 0,
        0, 0, 0, 1*/
    });
    // #endregion

    // #region 360 degrees
    it("Should be a 360 degree rotation about the x-axis", () => {
      const m = rotation4x4(360 * TO_RADIANS, 0, 0);

      assert4x4(m, identity4x4());
    });

    it("Should be a 360 degree rotation about the y-axis", () => {
      const m = rotation4x4(0, 360 * TO_RADIANS, 0);

      assert4x4(m, identity4x4());
    });

    it("Should be a 360 degree rotation about the z-axis", () => {
      const m = rotation4x4(0, 0, 360 * TO_RADIANS);

      assert4x4(m, identity4x4());
    });

    it("Should be a 360 degree rotation about the xy-axis", () => {
      const m = rotation4x4(360 * TO_RADIANS, 360 * TO_RADIANS, 0);

      assert4x4(m, identity4x4());
    });

    it("Should be a 360 degree rotation about the xz-axis", () => {
      const m = rotation4x4(360 * TO_RADIANS, 0, 360 * TO_RADIANS);

      assert4x4(m, identity4x4());
    });

    it("Should be a 360 degree rotation about the yz-axis", () => {
      const m = rotation4x4(0, 360 * TO_RADIANS, 360 * TO_RADIANS);

      assert4x4(m, identity4x4());
    });

    it("Should be a 360 degree rotation about the xyz-axis", () => {
      const m = rotation4x4(
        360 * TO_RADIANS,
        360 * TO_RADIANS,
        360 * TO_RADIANS
      );

      assert4x4(m, identity4x4());
    });

    it("Should modify to a 360 degree rotation about the x-axis", () => {
      rotation4x4(360 * TO_RADIANS, 0, 0, m4x4);

      assert4x4(m4x4, identity4x4());
    });

    it("Should modify to a 360 degree rotation about the y-axis", () => {
      rotation4x4(0, 360 * TO_RADIANS, 0, m4x4);

      assert4x4(m4x4, identity4x4());
    });

    it("Should modify to a 360 degree rotation about the z-axis", () => {
      rotation4x4(0, 0, 360 * TO_RADIANS, m4x4);

      assert4x4(m4x4, identity4x4());
    });

    it("Should modify to a 360 degree rotation about the xy-axis", () => {
      rotation4x4(360 * TO_RADIANS, 360 * TO_RADIANS, 0, m4x4);

      assert4x4(m4x4, identity4x4());
    });

    it("Should modify to a 360 degree rotation about the xz-axis", () => {
      rotation4x4(360 * TO_RADIANS, 0, 360 * TO_RADIANS, m4x4);

      assert4x4(m4x4, identity4x4());
    });

    it("Should modify to a 360 degree rotation about the yz-axis", () => {
      rotation4x4(0, 360 * TO_RADIANS, 360 * TO_RADIANS, m4x4);

      assert4x4(m4x4, identity4x4());
    });

    it("Should modify to a 360 degree rotation about the xyz-axis", () => {
      rotation4x4(360 * TO_RADIANS, 360 * TO_RADIANS, 360 * TO_RADIANS, m4x4);

      assert4x4(m4x4, identity4x4());
    });
    // #endregion

    // #region 180 degrees
    it("Should be a 180 degree rotation about the x-axis", () => {
      const m = rotation4x4(180 * TO_RADIANS, 0, 0);

      assert4x4(
        m,
        transpose4x4([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should be a 180 degree rotation about the y-axis", () => {
      const m = rotation4x4(0, 180 * TO_RADIANS, 0);

      assert4x4(
        m,
        transpose4x4([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should be a 180 degree rotation about the z-axis", () => {
      const m = rotation4x4(0, 0, 180 * TO_RADIANS);

      assert4x4(
        m,
        transpose4x4([-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );
    });

    it("Should be a 180 degree rotation about the xy-axis", () => {
      const m = rotation4x4(180 * TO_RADIANS, 180 * TO_RADIANS, 0);

      assert4x4(
        m,
        transpose4x4([-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );
    });

    it("Should be a 180 degree rotation about the xz-axis", () => {
      const m = rotation4x4(180 * TO_RADIANS, 0, 180 * TO_RADIANS);

      assert4x4(
        m,
        transpose4x4([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should be a 180 degree rotation about the yz-axis", () => {
      const m = rotation4x4(0, 180 * TO_RADIANS, 180 * TO_RADIANS);

      assert4x4(
        m,
        transpose4x4([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should be a 180 degree rotation about the xyz-axis", () => {
      const m = rotation4x4(
        180 * TO_RADIANS,
        180 * TO_RADIANS,
        180 * TO_RADIANS
      );

      assert4x4(
        m,
        transpose4x4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );
    });

    it("Should modify to a 180 degree rotation about the x-axis", () => {
      rotation4x4(180 * TO_RADIANS, 0, 0, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should modify to a 180 degree rotation about the y-axis", () => {
      rotation4x4(0, 180 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should modify to a 180 degree rotation about the z-axis", () => {
      rotation4x4(0, 0, 180 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );
    });

    it("Should modify to a 180 degree rotation about the xy-axis", () => {
      rotation4x4(180 * TO_RADIANS, 180 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );
    });

    it("Should modify to a 180 degree rotation about the xz-axis", () => {
      rotation4x4(180 * TO_RADIANS, 0, 180 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should modify to a 180 degree rotation about the yz-axis", () => {
      rotation4x4(0, 180 * TO_RADIANS, 180 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1])
      );
    });

    it("Should modify to a 180 degree rotation about the xyz-axis", () => {
      rotation4x4(180 * TO_RADIANS, 180 * TO_RADIANS, 180 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        transpose4x4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
      );
    });
    // #endregion

    // #region 90 degrees
    it("Should be a 90 degree rotation about the x-axis", () => {
      const m = rotation4x4(90 * TO_RADIANS, 0, 0);

      assert4x4(m, [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1]);
    });

    it("Should be a 90 degree rotation about the y-axis", () => {
      const m = rotation4x4(0, 90 * TO_RADIANS, 0);

      assert4x4(m, [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]);
    });

    it("Should be a 90 degree rotation about the z-axis", () => {
      const m = rotation4x4(0, 0, 90 * TO_RADIANS);

      assert4x4(m, [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });

    it("Should be a 90 degree rotation about the xy-axis", () => {
      const m = rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 0);

      assert4x4(m, [0, 0, -1, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 1]);
    });

    it("Should be a 90 degree rotation about the xz-axis", () => {
      const m = rotation4x4(90 * TO_RADIANS, 0, 90 * TO_RADIANS);

      assert4x4(m, [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1]);
    });

    it("Should be a 90 degree rotation about the yz-axis", () => {
      const m = rotation4x4(0, 90 * TO_RADIANS, 90 * TO_RADIANS);

      assert4x4(m, [0, -0, -1, 0, -1, 0, 0, 0, -0, 1, 0, 0, 0, 0, 0, 1]);
    });

    it("Should be a 90 degree rotation about the xyz-axis", () => {
      const m = rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 90 * TO_RADIANS);

      assert4x4(m, [-0, -0, -1, 0, 0, 1, -0, 0, 1, 0, -0, 0, 0, 0, 0, 1]);
    });

    it("Should modify to a 90 degree rotation about the x-axis", () => {
      rotation4x4(90 * TO_RADIANS, 0, 0, m4x4);

      assert4x4(m4x4, [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1]);
    });

    it("Should modify to a 90 degree rotation about the y-axis", () => {
      rotation4x4(0, 90 * TO_RADIANS, 0, m4x4);

      assert4x4(m4x4, [0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1]);
    });

    it("Should modify to a 90 degree rotation about the z-axis", () => {
      rotation4x4(0, 0, 90 * TO_RADIANS, m4x4);

      assert4x4(m4x4, [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    });

    it("Should modify to a 90 degree rotation about the xy-axis", () => {
      rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 0, m4x4);

      assert4x4(m4x4, [0, 0, -1, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 1]);
    });

    it("Should modify to a 90 degree rotation about the xz-axis", () => {
      rotation4x4(90 * TO_RADIANS, 0, 90 * TO_RADIANS, m4x4);

      assert4x4(m4x4, [0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1]);
    });

    it("Should modify to a 90 degree rotation about the yz-axis", () => {
      rotation4x4(0, 90 * TO_RADIANS, 90 * TO_RADIANS, m4x4);

      assert4x4(m4x4, [0, -0, -1, 0, -1, 0, 0, 0, -0, 1, 0, 0, 0, 0, 0, 1]);
    });

    it("Should modify to a 90 degree rotation about the xyz-axis", () => {
      rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 90 * TO_RADIANS, m4x4);

      assert4x4(m4x4, [-0, -0, -1, 0, 0, 1, -0, 0, 1, 0, -0, 0, 0, 0, 0, 1]);
    });
    // #endregion

    // #region 45 degrees
    it("Should be a 45 degree rotation about the x-axis", () => {
      const m = rotation4x4(45 * TO_RADIANS, 0, 0);

      assert4x4(
        m,
        [
          1, 0, 0, 0, 0, 0.7071068, 0.7071068, 0, 0, -0.7071068, 0.7071068, 0,
          0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 45 degree rotation about the y-axis", () => {
      const m = rotation4x4(0, 45 * TO_RADIANS, 0);

      assert4x4(
        m,
        [
          0.7071068, 0, -0.7071068, 0, 0, 1, 0, 0, 0.7071068, 0, 0.7071068, 0,
          0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 45 degree rotation about the z-axis", () => {
      const m = rotation4x4(0, 0, 45 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.7071068, 0.7071068, 0, 0, -0.7071068, 0.7071068, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 45 degree rotation about the xy-axis", () => {
      const m = rotation4x4(45 * TO_RADIANS, 45 * TO_RADIANS, 0);

      assert4x4(
        m,
        [
          0.7071068, 0, -0.7071068, 0, 0.5, 0.7071068, 0.5, 0, 0.5, -0.7071068,
          0.5, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 45 degree rotation about the xz-axis", () => {
      const m = rotation4x4(45 * TO_RADIANS, 0, 45 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.7071068, 0.7071068, 0, 0, -0.5, 0.5, 0.7071068, 0, 0.5, -0.5,
          0.7071068, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 45 degree rotation about the yz-axis", () => {
      const m = rotation4x4(0, 45 * TO_RADIANS, 45 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.5, 0.5, -0.7071068, 0, -0.7071068, 0.7071068, 0, 0, 0.5, 0.5,
          0.7071068, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 45 degree rotation about the xyz-axis", () => {
      const m = rotation4x4(45 * TO_RADIANS, 45 * TO_RADIANS, 45 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.5, 0.5, -0.7071068, 0, -0.1464466, 0.8535534, 0.5, 0, 0.8535534,
          -0.1464466, 0.5, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 45 degree rotation about the x-axis", () => {
      rotation4x4(45 * TO_RADIANS, 0, 0, m4x4);

      assert4x4(
        m4x4,
        [
          1, 0, 0, 0, 0, 0.7071068, 0.7071068, 0, 0, -0.7071068, 0.7071068, 0,
          0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 45 degree rotation about the y-axis", () => {
      rotation4x4(0, 45 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        [
          0.7071068, 0, -0.7071068, 0, 0, 1, 0, 0, 0.7071068, 0, 0.7071068, 0,
          0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 45 degree rotation about the z-axis", () => {
      rotation4x4(0, 0, 45 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.7071068, 0.7071068, 0, 0, -0.7071068, 0.7071068, 0, 0, 0, 0, 1, 0,
          0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 45 degree rotation about the xy-axis", () => {
      rotation4x4(45 * TO_RADIANS, 45 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        [
          0.7071068, 0, -0.7071068, 0, 0.5, 0.7071068, 0.5, 0, 0.5, -0.7071068,
          0.5, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 45 degree rotation about the xz-axis", () => {
      rotation4x4(45 * TO_RADIANS, 0, 45 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.7071068, 0.7071068, 0, 0, -0.5, 0.5, 0.7071068, 0, 0.5, -0.5,
          0.7071068, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 45 degree rotation about the yz-axis", () => {
      rotation4x4(0, 45 * TO_RADIANS, 45 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.5, 0.5, -0.7071068, 0, -0.7071068, 0.7071068, 0, 0, 0.5, 0.5,
          0.7071068, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 45 degree rotation about the xyz-axis", () => {
      rotation4x4(45 * TO_RADIANS, 45 * TO_RADIANS, 45 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.5, 0.5, -0.7071068, 0, -0.1464466, 0.8535534, 0.5, 0, 0.8535534,
          -0.1464466, 0.5, 0, 0, 0, 0, 1,
        ]
      );
    });
    // #endregion

    // #region arbitrary degrees
    it("Should be a 53 degree rotation about the x-axis", () => {
      const m = rotation4x4(53 * TO_RADIANS, 0, 0);

      assert4x4(
        m,
        [
          1.0, 0.0, 0.0, 0, 0.0, 0.601815, 0.7986355, 0, 0.0, -0.7986355,
          0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 53 degree rotation about the y-axis", () => {
      const m = rotation4x4(0, 53 * TO_RADIANS, 0);

      assert4x4(
        m,
        [
          0.601815, 0.0, -0.7986355, 0, 0.0, 1.0, 0.0, 0, 0.7986355, 0.0,
          0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 53 degree rotation about the z-axis", () => {
      const m = rotation4x4(0, 0, 53 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.601815, 0.7986355, 0.0, 0, -0.7986355, 0.601815, 0.0, 0, 0.0, 0.0,
          1.0, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 53 degree rotation about the xy-axis", () => {
      const m = rotation4x4(53 * TO_RADIANS, 53 * TO_RADIANS, 0);

      assert4x4(
        m,
        [
          0.601815, 0.0, -0.7986355, 0, 0.6378187, 0.601815, 0.4806308, 0,
          0.4806308, -0.7986355, 0.3621813, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 53 degree rotation about the xz-axis", () => {
      const m = rotation4x4(53 * TO_RADIANS, 0, 53 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.601815, 0.7986355, 0.0, 0, -0.4806308, 0.3621813, 0.7986355, 0,
          0.6378187, -0.4806308, 0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 53 degree rotation about the yz-axis", () => {
      const m = rotation4x4(0, 53 * TO_RADIANS, 53 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.3621813, 0.4806308, -0.7986355, 0, -0.7986355, 0.601815, 0.0, 0,
          0.4806308, 0.6378187, 0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a 53 degree rotation about the xyz-axis", () => {
      const m = rotation4x4(53 * TO_RADIANS, 53 * TO_RADIANS, 53 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.3621813, 0.4806308, -0.7986355, 0, -0.096782, 0.8715659, 0.4806308,
          0, 0.9270695, -0.096782, 0.3621813, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 53 degree rotation about the x-axis", () => {
      rotation4x4(53 * TO_RADIANS, 0, 0, m4x4);

      assert4x4(
        m4x4,
        [
          1.0, 0.0, 0.0, 0, 0.0, 0.601815, 0.7986355, 0, 0.0, -0.7986355,
          0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 53 degree rotation about the y-axis", () => {
      rotation4x4(0, 53 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        [
          0.601815, 0.0, -0.7986355, 0, 0.0, 1.0, 0.0, 0, 0.7986355, 0.0,
          0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 53 degree rotation about the z-axis", () => {
      rotation4x4(0, 0, 53 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.601815, 0.7986355, 0.0, 0, -0.7986355, 0.601815, 0.0, 0, 0.0, 0.0,
          1.0, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 53 degree rotation about the xy-axis", () => {
      rotation4x4(53 * TO_RADIANS, 53 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        [
          0.601815, 0.0, -0.7986355, 0, 0.6378187, 0.601815, 0.4806308, 0,
          0.4806308, -0.7986355, 0.3621813, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 53 degree rotation about the xz-axis", () => {
      rotation4x4(53 * TO_RADIANS, 0, 53 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.601815, 0.7986355, 0.0, 0, -0.4806308, 0.3621813, 0.7986355, 0,
          0.6378187, -0.4806308, 0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 53 degree rotation about the yz-axis", () => {
      rotation4x4(0, 53 * TO_RADIANS, 53 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.3621813, 0.4806308, -0.7986355, 0, -0.7986355, 0.601815, 0.0, 0,
          0.4806308, 0.6378187, 0.601815, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a 53 degree rotation about the xyz-axis", () => {
      rotation4x4(53 * TO_RADIANS, 53 * TO_RADIANS, 53 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.3621813, 0.4806308, -0.7986355, 0, -0.096782, 0.8715659, 0.4806308,
          0, 0.9270695, -0.096782, 0.3621813, 0, 0, 0, 0, 1,
        ]
      );
    });
    // #endregion

    // #region negative degrees
    it("Should be a -51 degree rotation about the x-axis", () => {
      const m = rotation4x4(-51 * TO_RADIANS, 0, 0);

      assert4x4(
        m,
        [
          1.0, 0.0, 0.0, 0, 0.0, 0.6293204, -0.777146, 0, 0.0, 0.777146,
          0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a -51 degree rotation about the y-axis", () => {
      const m = rotation4x4(0, -51 * TO_RADIANS, 0);

      assert4x4(
        m,
        [
          0.6293204, 0.0, 0.777146, 0, 0.0, 1.0, 0.0, 0, -0.777146, 0.0,
          0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a -51 degree rotation about the z-axis", () => {
      const m = rotation4x4(0, 0, -51 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.6293204, -0.777146, 0.0, 0, 0.777146, 0.6293204, 0.0, 0, 0.0, 0.0,
          1.0, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a -51 degree rotation about the xy-axis", () => {
      const m = rotation4x4(-51 * TO_RADIANS, -51 * TO_RADIANS, 0);

      assert4x4(
        m,
        [
          0.6293204, 0.0, 0.777146, 0, 0.6039559, 0.6293204, -0.4890738, 0,
          -0.4890738, 0.777146, 0.3960442, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a -51 degree rotation about the xz-axis", () => {
      const m = rotation4x4(-51 * TO_RADIANS, 0, -51 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.6293204, -0.777146, 0.0, 0, 0.4890738, 0.3960442, -0.777146, 0,
          0.6039559, 0.4890738, 0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a -51 degree rotation about the yz-axis", () => {
      const m = rotation4x4(0, -51 * TO_RADIANS, -51 * TO_RADIANS);

      assert4x4(
        m,
        [
          0.3960442, -0.4890738, 0.777146, 0, 0.777146, 0.6293204, 0.0, 0,
          -0.4890738, 0.6039559, 0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should be a -51 degree rotation about the xyz-axis", () => {
      const m = rotation4x4(
        -51 * TO_RADIANS,
        -51 * TO_RADIANS,
        -51 * TO_RADIANS
      );

      assert4x4(
        m,
        [
          0.3960442, -0.4890738, 0.777146, 0, 0.8691555, -0.0733177, -0.4890738,
          0, 0.2961717, 0.8691555, 0.3960442, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a -51 degree rotation about the x-axis", () => {
      rotation4x4(-51 * TO_RADIANS, 0, 0, m4x4);

      assert4x4(
        m4x4,
        [
          1.0, 0.0, 0.0, 0, 0.0, 0.6293204, -0.777146, 0, 0.0, 0.777146,
          0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a -51 degree rotation about the y-axis", () => {
      rotation4x4(0, -51 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        [
          0.6293204, 0.0, 0.777146, 0, 0.0, 1.0, 0.0, 0, -0.777146, 0.0,
          0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a -51 degree rotation about the z-axis", () => {
      rotation4x4(0, 0, -51 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.6293204, -0.777146, 0.0, 0, 0.777146, 0.6293204, 0.0, 0, 0.0, 0.0,
          1.0, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a -51 degree rotation about the xy-axis", () => {
      rotation4x4(-51 * TO_RADIANS, -51 * TO_RADIANS, 0, m4x4);

      assert4x4(
        m4x4,
        [
          0.6293204, 0.0, 0.777146, 0, 0.6039559, 0.6293204, -0.4890738, 0,
          -0.4890738, 0.777146, 0.3960442, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a -51 degree rotation about the xz-axis", () => {
      rotation4x4(-51 * TO_RADIANS, 0, -51 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.6293204, -0.777146, 0.0, 0, 0.4890738, 0.3960442, -0.777146, 0,
          0.6039559, 0.4890738, 0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a -51 degree rotation about the yz-axis", () => {
      rotation4x4(0, -51 * TO_RADIANS, -51 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.3960442, -0.4890738, 0.777146, 0, 0.777146, 0.6293204, 0.0, 0,
          -0.4890738, 0.6039559, 0.6293204, 0, 0, 0, 0, 1,
        ]
      );
    });

    it("Should modify to a -51 degree rotation about the xyz-axis", () => {
      rotation4x4(-51 * TO_RADIANS, -51 * TO_RADIANS, -51 * TO_RADIANS, m4x4);

      assert4x4(
        m4x4,
        [
          0.3960442, -0.4890738, 0.777146, 0, 0.8691555, -0.0733177, -0.4890738,
          0, 0.2961717, 0.8691555, 0.3960442, 0, 0, 0, 0, 1,
        ]
      );
    });
    // #endregion
  });

  describe("Scalar", () => {
    it("Should scale all 2x2 items by a scalar", () => {
      const m: Mat2x2 = [1, 2, 3, 4];
      const t = multiplyScalar2x2(m, 5);
      assert2x2(t, [5, 10, 15, 20]);
    });

    it("Should scale all 2x2 items by a scalar and apply", () => {
      const m: Mat2x2 = [1, 2, 3, 4];
      multiplyScalar2x2(m, 5, m);
      assert2x2(m, [5, 10, 15, 20]);
    });

    it("Should scale all 3x3 items by a scalar", () => {
      const m: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const t = multiplyScalar3x3(m, 5);
      assert3x3(t, [5, 10, 15, 20, 25, 30, 35, 40, 45]);
    });

    it("Should scale all 3x3 items by a scalar and apply", () => {
      const m: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      multiplyScalar3x3(m, 5, m);
      assert3x3(m, [5, 10, 15, 20, 25, 30, 35, 40, 45]);
    });

    it("Should scale all 4x4 items by a scalar", () => {
      const m: Mat4x4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const t = multiplyScalar4x4(m, 5);
      assert4x4(
        t,
        [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]
      );
    });

    it("Should scale all 4x4 items by a scalar and apply", () => {
      const m: Mat4x4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      multiplyScalar4x4(m, 5, m);
      assert4x4(
        m,
        [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80]
      );
    });
  });

  describe("Concatenate / Multiply", () => {
    it("Should make a 2x2 identity", () => {
      const m1 = identity2x2();
      const m2 = identity2x2();

      assert2x2(multiply2x2(m1, m2), identity2x2());
    });

    it("Should make a 2x2 identity commutative", () => {
      const m1 = identity2x2();
      const m2 = identity2x2();

      assert2x2(multiply2x2(m1, m2), identity2x2());
    });

    it("Should modify to a 2x2 identity", () => {
      const m1 = identity2x2();
      const m2 = identity2x2();
      multiply2x2(m1, m2, m1);

      assert2x2(m1, identity2x2());
    });

    it("Should make the original 2x2", () => {
      const m1: Mat2x2 = [1, 2, 3, 4];
      const m2 = identity2x2();

      assert2x2(multiply2x2(m1, m2), [1, 2, 3, 4]);
    });

    it("Should make the original 2x2 commutative", () => {
      const m1: Mat2x2 = [1, 2, 3, 4];
      const m2 = identity2x2();

      assert2x2(multiply2x2(m2, m1), [1, 2, 3, 4]);
    });

    it("Should multiply both 2x2 matrices together", () => {
      const m1: Mat2x2 = [1, 2, 3, 4];
      const m2: Mat2x2 = [4, 3, 2, 1];

      assert2x2(multiply2x2(m1, m2), [13, 20, 5, 8]);
    });

    it("Should multiply 2x2 and be non-commutative", () => {
      const m1: Mat2x2 = [1, 2, 3, 4];
      const m2: Mat2x2 = [4, 3, 2, 1];

      assert2x2(multiply2x2(m2, m1), [8, 5, 20, 13]);
    });

    it("Should make a 3x3 identity", () => {
      const m1 = identity3x3();
      const m2 = identity3x3();

      assert3x3(multiply3x3(m1, m2), identity3x3());
    });

    it("Should make a 3x3 identity commutative", () => {
      const m1 = identity3x3();
      const m2 = identity3x3();

      assert3x3(multiply3x3(m2, m1), identity3x3());
    });

    it("Should modify to a 3x3 identity", () => {
      const m1 = identity3x3();
      const m2 = identity3x3();
      multiply3x3(m1, m2, m1);

      assert3x3(m1, identity3x3());
    });

    it("Should make the original 3x3", () => {
      const m1: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m2 = identity3x3();

      assert3x3(multiply3x3(m1, m2), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("Should make the original 3x3 commutative", () => {
      const m1: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m2 = identity3x3();

      assert3x3(multiply3x3(m2, m1), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("Should multiply both 3x3 matrices together", () => {
      const m1: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m2: Mat3x3 = [9, 8, 7, 6, 5, 4, 3, 2, 1];

      assert3x3(multiply3x3(m1, m2), [90, 114, 138, 54, 69, 84, 18, 24, 30]);
    });

    it("Should multiply 3x3 and be non-commutative", () => {
      const m1: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m2: Mat3x3 = [9, 8, 7, 6, 5, 4, 3, 2, 1];

      assert3x3(multiply3x3(m2, m1), [30, 24, 18, 84, 69, 54, 138, 114, 90]);
    });

    it("Should make a 4x4 identity", () => {
      const m1 = identity4x4();
      const m2 = identity4x4();

      assert4x4(multiply4x4(m1, m2), identity4x4());
    });

    it("Should make a 4x4 identity commutative", () => {
      const m1 = identity4x4();
      const m2 = identity4x4();

      assert4x4(multiply4x4(m2, m1), identity4x4());
    });

    it("Should modify to a 4x4 identity", () => {
      const m1 = identity4x4();
      const m2 = identity4x4();
      multiply4x4(m1, m2, m1);

      assert4x4(m1, identity4x4());
    });

    it("Should make the original 4x4", () => {
      const m1: Mat4x4 = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ];
      const m2 = identity4x4();

      assert4x4(
        multiply4x4(m1, m2),
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      );
    });

    it("Should make the original 4x4 commutative", () => {
      const m1: Mat4x4 = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ];
      const m2 = identity4x4();

      assert4x4(
        multiply4x4(m2, m1),
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      );
    });

    it("Should multiply both 4x4 matrices together", () => {
      const m1: Mat4x4 = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ];
      const m2: Mat4x4 = [
        16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
      ];

      assert4x4(
        multiply4x4(m1, m2),
        [
          386, 444, 502, 560, 274, 316, 358, 400, 162, 188, 214, 240, 50, 60,
          70, 80,
        ]
      );
    });

    it("Should multiply 4x4 and be non-commutative", () => {
      const m1: Mat4x4 = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ];
      const m2: Mat4x4 = [
        16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
      ];

      assert4x4(
        multiply4x4(m2, m1),
        [
          80, 70, 60, 50, 240, 214, 188, 162, 400, 358, 316, 274, 560, 502, 444,
          386,
        ]
      );
    });
  });

  describe("Transform Vectors", () => {
    it("Should multiply matrix 2x2 with Vec2 and produce same Vec2", () => {
      const m = identity2x2();
      const v: Vec2 = [1, 2];

      assert2(transform2(m, v), [1, 2]);
    });

    it("Should multiply matrix 2x2 with Vec2 and modify to same Vec2", () => {
      const m = identity2x2();
      const v: Vec2 = [1, 2];
      transform2(m, v, v);

      assert2(v, [1, 2]);
    });

    it("Should multiply matrix 2x2 with Vec2", () => {
      const m: Mat2x2 = transpose2x2([1, 2, 3, 4]);
      const v: Vec2 = [2, 1];

      assert2(transform2(m, v), [4, 10]);
    });

    it("Should multiply matrix 2x2 with Vec2 and modify", () => {
      const m: Mat2x2 = transpose2x2([1, 2, 3, 4]);
      const v: Vec2 = [2, 1];
      transform2(m, v, v);

      assert2(v, [4, 10]);
    });

    it("Should multiply matrix 3x3 with Vec3 and produce same Vec3", () => {
      const m = identity3x3();
      const v: Vec3 = [1, 2, 3];

      assert3(transform3(m, v), [1, 2, 3]);
    });

    it("Should multiply matrix 3x3 with Vec3 and modify to same Vec3", () => {
      const m = identity3x3();
      const v: Vec3 = [1, 2, 3];
      transform3(m, v, v);

      assert3(v, [1, 2, 3]);
    });

    it("Should multiply matrix 3x3 with Vec3", () => {
      const m: Mat3x3 = transpose3x3([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const v: Vec3 = [3, 2, 1];

      assert3(transform3(m, v), [10, 28, 46]);
    });

    it("Should multiply matrix 3x3 with Vec3 and modify", () => {
      const m: Mat3x3 = transpose3x3([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const v: Vec3 = [3, 2, 1];
      transform3(m, v, v);

      assert3(v, [10, 28, 46]);
    });

    it("Should multiply matrix 4x4 with Vec4 and produce same Vec4", () => {
      const m = identity4x4();
      const v: Vec4 = [1, 2, 3, 4];

      assert4(transform4(m, v), [1, 2, 3, 4]);
    });

    it("Should multiply matrix 4x4 with Vec4 and modify to same Vec4", () => {
      const m = identity4x4();
      const v: Vec4 = [1, 2, 3, 4];
      transform4(m, v, v);

      assert4(v, [1, 2, 3, 4]);
    });

    it("Should multiply matrix 4x4 with Vec4", () => {
      const m: Mat4x4 = transpose4x4([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ]);
      const v: Vec4 = [4, 3, 2, 1];

      assert4(transform4(m, v), [20, 60, 100, 140]);
    });

    it("Should multiply matrix 4x4 with Vec4 and modify", () => {
      const m: Mat4x4 = transpose4x4([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ]);
      const v: Vec4 = [4, 3, 2, 1];
      transform4(m, v, v);

      assert4(v, [20, 60, 100, 140]);
    });
  });

  describe("Translation Transforms", () => {
    it("Should be identity", () => {
      const m = translation4x4(0, 0, 0);
      assert4x4(m, identity4x4());
    });

    it("Should modify to identity", () => {
      const m: Mat4x4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      translation4x4(0, 0, 0, m);
      assert4x4(m, identity4x4());
    });

    it("Should be identity by Vec3", () => {
      const m = translation4x4by3([0, 0, 0]);
      assert4x4(m, identity4x4());
    });

    it("Should modify to identity by Vec3", () => {
      const m: Mat4x4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      translation4x4by3([0, 0, 0], m);
      assert4x4(m, identity4x4());
    });

    it("Should not translate", () => {
      const m = translation4x4(0, 0, 0);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [1, 2, 3, 1]);
    });

    it("Should translate x only", () => {
      const m = translation4x4(13, 0, 0);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [14, 2, 3, 1]);
    });

    it("Should translate y only", () => {
      const m = translation4x4(0, 13, 0);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [1, 15, 3, 1]);
    });

    it("Should translate z only", () => {
      const m = translation4x4(0, 0, 13);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [1, 2, 16, 1]);
    });

    it("Should translate xy only", () => {
      const m = translation4x4(13, 13, 0);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [14, 15, 3, 1]);
    });

    it("Should translate xz only", () => {
      const m = translation4x4(13, 0, 13);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [14, 2, 16, 1]);
    });

    it("Should translate yz only", () => {
      const m = translation4x4(0, 13, 13);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [1, 15, 16, 1]);
    });

    it("Should translate xyz", () => {
      const m = translation4x4(13, 13, 13);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [14, 15, 16, 1]);
    });

    it("Should translate negative values", () => {
      const m = translation4x4(-13, -13, -13);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [-12, -11, -10, 1]);
    });

    it("Should translate fractions", () => {
      const m = translation4x4(1e-7, 1e-7, 1e-7);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [1.0000001, 2.0000001, 3.0000001, 1]);
    });

    it("Should translate negative fractions", () => {
      const m = translation4x4(-1e-7, -1e-7, -1e-7);
      const v: Vec4 = [1, 2, 3, 1];
      assert4(transform4(m, v), [0.9999999, 1.9999999, 2.9999999, 1]);
    });

    it("Should NOT translate when w = 0", () => {
      const m = translation4x4(-13, -13, -13);
      const v: Vec4 = [1, 2, 3, 0];
      assert4(transform4(m, v), [1, 2, 3, 0]);
    });
  });

  describe("Scaling Transforms", () => {
    it("Should be identity", () => {
      const m = scale4x4(1, 1, 1);
      assert4x4(m, identity4x4());
    });

    it("Should modify to identity", () => {
      const m: Mat4x4 = identity4x4();
      scale4x4(1, 1, 1, m);
      assert4x4(m, identity4x4());
    });

    it("Should be identity by Vec3", () => {
      const m = scale4x4by3([1, 1, 1]);
      assert4x4(m, identity4x4());
    });

    it("Should modify to identity by Vec3", () => {
      const m: Mat4x4 = identity4x4();
      scale4x4by3([1, 1, 1], m);
      assert4x4(m, identity4x4());
    });

    it("Should scale x only", () => {
      const m = scale4x4(20, 1, 1);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [40, 3, 4, 1]);
    });

    it("Should scale y only", () => {
      const m = scale4x4(1, 20, 1);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [2, 60, 4, 1]);
    });

    it("Should scale z only", () => {
      const m = scale4x4(1, 1, 20);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [2, 3, 80, 1]);
    });

    it("Should scale xy only", () => {
      const m = scale4x4(20, 20, 1);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [40, 60, 4, 1]);
    });

    it("Should scale xz only", () => {
      const m = scale4x4(20, 1, 20);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [40, 3, 80, 1]);
    });

    it("Should scale yz only", () => {
      const m = scale4x4(1, 20, 20);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [2, 60, 80, 1]);
    });

    it("Should scale xyz", () => {
      const m = scale4x4(20, 20, 20);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [40, 60, 80, 1]);
    });

    it("Should scale negative", () => {
      const m = scale4x4(-10, -20, -30);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [-20, -60, -120, 1]);
    });

    it("Should scale fractions", () => {
      const m = scale4x4(0.23, -0.55, 2.234);
      const v: Vec4 = [2, 3, 4, 1];
      assert4(transform4(m, v), [0.46, -1.65, 8.936, 1]);
    });
  });

  describe("Rotation Transforms (Right hand rule)", () => {
    it("Should be identity", () => {
      const m = rotation4x4(0, 0, 0);
      assert4x4(m, identity4x4());
    });

    it("Should modify to identity", () => {
      const m: Mat4x4 = identity4x4();
      rotation4x4(0, 0, 0, m);
      assert4x4(m, identity4x4());
    });

    it("Should be identity by Vec3", () => {
      const m = rotation4x4by3([0, 0, 0]);
      assert4x4(m, identity4x4());
    });

    it("Should modify to identity by Vec3", () => {
      const m: Mat4x4 = identity4x4();
      rotation4x4by3([0, 0, 0], m);
      assert4x4(m, identity4x4());
    });

    it("Should rotate x only 90 degrees (w = 1)", () => {
      const m = rotation4x4(90 * TO_RADIANS, 0, 0);
      const v: Vec4 = [1, 1, 1, 1];
      assert4(transform4(m, v), [1, -1, 1, 1]);
    });

    it("Should rotate y only 90 degrees (w = 1)", () => {
      const m = rotation4x4(0, 90 * TO_RADIANS, 0);
      const v: Vec4 = [1, 1, 1, 1];
      assert4(transform4(m, v), [1, 1, -1, 1]);
    });

    it("Should rotate z only 90 degrees (w = 1)", () => {
      const m = rotation4x4(0, 0, 90 * TO_RADIANS);
      const v: Vec4 = [1, 1, 1, 1];
      assert4(transform4(m, v), [-1, 1, 1, 1]);
    });

    it("Should rotate x then y only 90 degrees (w = 1)", () => {
      const m = rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 0);
      const v: Vec4 = [1, 1, 1, 1];

      assert4(transform4(m, v), [1, -1, -1, 1]);
    });

    it("Should rotate x then z only 90 degrees (w = 1)", () => {
      const m = rotation4x4(90 * TO_RADIANS, 0, 90 * TO_RADIANS);
      const v: Vec4 = [1, 1, 1, 1];

      assert4(transform4(m, v), [1, 1, 1, 1]);
    });

    it("Should rotate y then z only 90 degrees (w = 1)", () => {
      const m = rotation4x4(0, 90 * TO_RADIANS, 90 * TO_RADIANS);
      const v: Vec4 = [1, 1, 1, 1];

      assert4(transform4(m, v), [-1, 1, -1, 1]);
    });

    it("Should rotate x then y then z 90 degrees (w = 1)", () => {
      const v: Vec4 = [1, 1, 1, 1];
      const m0 = rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 90 * TO_RADIANS);

      assert4(transform4(m0, v), [1, 1, -1, 1]);
    });

    it("Should rotate regardless of w value", () => {
      const v: Vec4 = [1, 1, 1, 0];

      const a: Mat4x4 = rotation4x4(0, 0, 90 * TO_RADIANS);
      const b: Vec4 = transform4(
        rotation4x4(0, 90 * TO_RADIANS, 0),
        transform4(rotation4x4(90 * TO_RADIANS, 0, 0), v)
      );

      assert4(transform4(a, b), [1, 1, -1, 0]);
    });
  });

  describe("Shear transforms", () => {
    it("Should produce identity 2x2", () => {
      assert2x2(shearX2x2(0), identity2x2());
    });

    it("Should produce identity 4x4", () => {
      assert4x4(shearX4x4(0, 0), identity4x4());
    });

    it("Should modify to identity 2x2", () => {
      const m: Mat2x2 = [0, 0, 0, 0];
      shearX2x2(0, m);
      assert2x2(m, identity2x2());
    });

    it("Should modify to identity 4x4", () => {
      const m: Mat4x4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      shearX4x4(0, 0, m);
      assert4x4(m, identity4x4());
    });

    it("Should produce identity 2x2", () => {
      assert2x2(shearY2x2(0), identity2x2());
    });

    it("Should produce identity 4x4", () => {
      assert4x4(shearY4x4(0, 0), identity4x4());
    });

    it("Should modify to identity 2x2", () => {
      const m: Mat2x2 = [0, 0, 0, 0];
      shearY2x2(0, m);
      assert2x2(m, identity2x2());
    });

    it("Should modify to identity 4x4", () => {
      const m: Mat4x4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      shearY4x4(0, 0, m);
      assert4x4(m, identity4x4());
    });

    it("Should produce identity 4x4", () => {
      assert4x4(shearZ4x4(0, 0), identity4x4());
    });

    it("Should modify to identity 4x4", () => {
      const m: Mat4x4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      shearZ4x4(0, 0, m);
      assert4x4(m, identity4x4());
    });

    // #region 45 degrees
    it("Should shear Vec2 parallel to x-axis by 45 degrees", () => {
      const m: Mat2x2 = shearX2x2(45 * TO_RADIANS);
      const v: Vec2 = [0, 1];

      assert2(transform2(m, v), [1, 1]);
    });

    it("Should shear and modify Vec2 parallel to x-axis by 45 degrees", () => {
      const m: Mat2x2 = shearX2x2(45 * TO_RADIANS);
      const v: Vec2 = [0, 1];
      transform2(m, v, v);

      assert2(v, [1, 1]);
    });

    it("Should shear Vec2 parallel to y-axis by 45 degrees", () => {
      const m: Mat2x2 = shearY2x2(45 * TO_RADIANS);
      const v: Vec2 = [1, 0];

      assert2(transform2(m, v), [1, 1]);
    });

    it("Should shear and modify Vec2 parallel to y-axis by 45 degrees", () => {
      const m: Mat2x2 = shearY2x2(45 * TO_RADIANS);
      const v: Vec2 = [1, 0];
      transform2(m, v, v);

      assert2(v, [1, 1]);
    });

    it("Should shear Vec4 parallel to the x-axis by 45 degrees", () => {
      const m = shearX4x4(45 * TO_RADIANS, 45 * TO_RADIANS);
      const v: Vec4 = [0, 1, 0, 0];

      assert4(transform4(m, v), [1, 1, 0, 0]);
    });

    it("Should shear Vec4 parallel to the x-axis by 45 degrees", () => {
      const m = shearX4x4(45 * TO_RADIANS, 45 * TO_RADIANS);
      const v: Vec4 = [0, 0, 1, 0];

      assert4(transform4(m, v), [1, 0, 1, 0]);
    });

    it("Should shear Vec4 parallel to the y-axis by 45 degrees", () => {
      const m = shearY4x4(45 * TO_RADIANS, 45 * TO_RADIANS);
      const v: Vec4 = [1, 0, 0, 0];

      assert4(transform4(m, v), [1, 1, 0, 0]);
    });

    it("Should shear Vec4 parallel to the y-axis by 45 degrees", () => {
      const m = shearY4x4(45 * TO_RADIANS, 45 * TO_RADIANS);
      const v: Vec4 = [0, 0, 1, 0];

      assert4(transform4(m, v), [0, 1, 1, 0]);
    });

    it("Should shear Vec4 parallel to the z-axis by 45 degrees", () => {
      const m = shearZ4x4(45 * TO_RADIANS, 45 * TO_RADIANS);
      const v: Vec4 = [1, 0, 0, 0];

      assert4(transform4(m, v), [1, 0, 1, 0]);
    });

    it("Should shear Vec4 parallel to the z-axis by 45 degrees", () => {
      const m = shearZ4x4(45 * TO_RADIANS, 45 * TO_RADIANS);
      const v: Vec4 = [0, 1, 0, 0];

      assert4(transform4(m, v), [0, 1, 1, 0]);
    });
    // #endregion

    // #region 63.4349488229 degrees
    it("Should shear Vec2 parallel to x-axis by 63.4349488229 degrees", () => {
      const m: Mat2x2 = shearX2x2(63.4349488229 * TO_RADIANS);
      const v: Vec2 = [0, 1];

      assert2(transform2(m, v), [2, 1]);
    });

    it("Should shear and modify Vec2 parallel to x-axis by 63.4349488229 degrees", () => {
      const m: Mat2x2 = shearX2x2(63.4349488229 * TO_RADIANS);
      const v: Vec2 = [0, 1];
      transform2(m, v, v);

      assert2(v, [2, 1]);
    });

    it("Should shear Vec2 parallel to y-axis by 63.4349488229 degrees", () => {
      const m: Mat2x2 = shearY2x2(63.4349488229 * TO_RADIANS);
      const v: Vec2 = [1, 0];

      assert2(transform2(m, v), [1, 2]);
    });

    it("Should shear and modify Vec2 parallel to y-axis by 63.4349488229 degrees", () => {
      const m: Mat2x2 = shearY2x2(63.4349488229 * TO_RADIANS);
      const v: Vec2 = [1, 0];
      transform2(m, v, v);

      assert2(v, [1, 2]);
    });

    it("Should shear Vec4 parallel to the x-axis by 63.4349488229 degrees", () => {
      const m = shearX4x4(
        63.4349488229 * TO_RADIANS,
        63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 1, 0, 0];

      assert4(transform4(m, v), [2, 1, 0, 0]);
    });

    it("Should shear Vec4 parallel to the x-axis by 63.4349488229 degrees", () => {
      const m = shearX4x4(
        63.4349488229 * TO_RADIANS,
        63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 0, 1, 0];

      assert4(transform4(m, v), [2, 0, 1, 0]);
    });

    it("Should shear Vec4 parallel to the y-axis by 63.4349488229 degrees", () => {
      const m = shearY4x4(
        63.4349488229 * TO_RADIANS,
        63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [1, 0, 0, 0];

      assert4(transform4(m, v), [1, 2, 0, 0]);
    });

    it("Should shear Vec4 parallel to the y-axis by 63.4349488229 degrees", () => {
      const m = shearY4x4(
        63.4349488229 * TO_RADIANS,
        63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 0, 1, 0];

      assert4(transform4(m, v), [0, 2, 1, 0]);
    });

    it("Should shear Vec4 parallel to the z-axis by 63.4349488229 degrees", () => {
      const m = shearZ4x4(
        63.4349488229 * TO_RADIANS,
        63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [1, 0, 0, 0];

      assert4(transform4(m, v), [1, 0, 2, 0]);
    });

    it("Should shear Vec4 parallel to the z-axis by 63.4349488229 degrees", () => {
      const m = shearZ4x4(
        63.4349488229 * TO_RADIANS,
        63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 1, 0, 0];

      assert4(transform4(m, v), [0, 1, 2, 0]);
    });
    // #endregion

    // #region -63.4349488229 degrees
    it("Should shear Vec2 parallel to x-axis by -63.4349488229 degrees", () => {
      const m: Mat2x2 = shearX2x2(-63.4349488229 * TO_RADIANS);
      const v: Vec2 = [0, 1];

      assert2(transform2(m, v), [-2, 1]);
    });

    it("Should shear and modify Vec2 parallel to x-axis by -63.4349488229 degrees", () => {
      const m: Mat2x2 = shearX2x2(-63.4349488229 * TO_RADIANS);
      const v: Vec2 = [0, 1];
      transform2(m, v, v);

      assert2(v, [-2, 1]);
    });

    it("Should shear Vec2 parallel to y-axis by -63.4349488229 degrees", () => {
      const m: Mat2x2 = shearY2x2(-63.4349488229 * TO_RADIANS);
      const v: Vec2 = [1, 0];

      assert2(transform2(m, v), [1, -2]);
    });

    it("Should shear and modify Vec2 parallel to y-axis by -63.4349488229 degrees", () => {
      const m: Mat2x2 = shearY2x2(-63.4349488229 * TO_RADIANS);
      const v: Vec2 = [1, 0];
      transform2(m, v, v);

      assert2(v, [1, -2]);
    });

    it("Should shear Vec4 parallel to the x-axis by -63.4349488229 degrees", () => {
      const m = shearX4x4(
        -63.4349488229 * TO_RADIANS,
        -63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 1, 0, 0];

      assert4(transform4(m, v), [-2, 1, 0, 0]);
    });

    it("Should shear Vec4 parallel to the x-axis by -63.4349488229 degrees", () => {
      const m = shearX4x4(
        -63.4349488229 * TO_RADIANS,
        -63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 0, 1, 0];

      assert4(transform4(m, v), [-2, 0, 1, 0]);
    });

    it("Should shear Vec4 parallel to the y-axis by -63.4349488229 degrees", () => {
      const m = shearY4x4(
        -63.4349488229 * TO_RADIANS,
        -63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [1, 0, 0, 0];

      assert4(transform4(m, v), [1, -2, 0, 0]);
    });

    it("Should shear Vec4 parallel to the y-axis by -63.4349488229 degrees", () => {
      const m = shearY4x4(
        -63.4349488229 * TO_RADIANS,
        -63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 0, 1, 0];

      assert4(transform4(m, v), [0, -2, 1, 0]);
    });

    it("Should shear Vec4 parallel to the z-axis by -63.4349488229 degrees", () => {
      const m = shearZ4x4(
        -63.4349488229 * TO_RADIANS,
        -63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [1, 0, 0, 0];

      assert4(transform4(m, v), [1, 0, -2, 0]);
    });

    it("Should shear Vec4 parallel to the z-axis by -63.4349488229 degrees", () => {
      const m = shearZ4x4(
        -63.4349488229 * TO_RADIANS,
        -63.4349488229 * TO_RADIANS
      );
      const v: Vec4 = [0, 1, 0, 0];

      assert4(transform4(m, v), [0, 1, -2, 0]);
    });
    // #endregion
  });

  describe("Transforms: Order of operations", () => {
    it("Should scale then translate", () => {
      const s = scale4x4(1, 2, 3);
      const t = translation4x4(10, 20, 30);
      const v: Vec4 = [1, 1, 1, 1];

      const r = transform4(multiply4x4(t, s), v);

      assert4(r, [11, 22, 33, 1]);
    });

    it("Should translate then scale", () => {
      const s = scale4x4(1, 2, 3);
      const t = translation4x4(10, 20, 30);
      const v: Vec4 = [1, 1, 1, 1];

      const r = transform4(multiply4x4(s, t), v);

      assert4(r, [11, 42, 93, 1]);
    });

    it("Should scale then rotate", () => {
      const s = scale4x4(1, 2, 3);
      const rot = rotation4x4(
        90 * TO_RADIANS,
        90 * TO_RADIANS,
        90 * TO_RADIANS
      );
      const v: Vec4 = [1, 1, 1, 1];

      const r = transform4(multiply4x4(rot, s), v);

      assert4(r, [3, 2, -1, 1]);
    });

    it("Should rotate then scale", () => {
      const s = scale4x4(1, 2, 3);
      const rot = rotation4x4(
        90 * TO_RADIANS,
        90 * TO_RADIANS,
        90 * TO_RADIANS
      );
      const v: Vec4 = [1, 1, 1, 1];

      const r = transform4(multiply4x4(s, rot), v);

      assert4(r, [1, 2, -3, 1]);
    });

    it("Should rotate then translate", () => {
      const t = translation4x4(10, 20, 30);
      const rot = rotation4x4(
        90 * TO_RADIANS,
        90 * TO_RADIANS,
        90 * TO_RADIANS
      );
      const v: Vec4 = [1, 1, 1, 1];

      const r = transform4(multiply4x4(t, rot), v);

      assert4(r, [11, 21, 29, 1]);
    });

    it("Should translate then rotate", () => {
      const t = translation4x4(10, 20, 30);
      const rot = rotation4x4(
        90 * TO_RADIANS,
        90 * TO_RADIANS,
        90 * TO_RADIANS
      );
      const v: Vec4 = [1, 1, 1, 1];

      const r = transform4(multiply4x4(rot, t), v);

      assert4(r, [31, 21, -11, 1]);
    });

    it("Should concat multiple operations", () => {
      const v: Vec4 = [1, 1, 1, 1];
      const t = concat4x4(
        undefined,
        rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 90 * TO_RADIANS),
        translation4x4(10, 20, 30),
        scale4x4(1, 2, 3)
      );

      assert4(transform4(t, v), [33, 22, -11, 1]);
    });

    it("Should concat multiple operations and modify", () => {
      const m = identity4x4();
      const v: Vec4 = [1, 1, 1, 1];

      concat4x4(
        m,
        rotation4x4(90 * TO_RADIANS, 90 * TO_RADIANS, 90 * TO_RADIANS),
        translation4x4(10, 20, 30),
        scale4x4(1, 2, 3)
      );

      assert4(transform4(m, v), [33, 22, -11, 1]);
    });
  });

  describe("Clone", () => {
    it("Should copy the matrix", () => {
      const m2: Mat2x2 = [1, 2, 3, 4];
      const m3: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m4: Mat4x4 = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ];

      const c2 = copy2x2(m2);
      assert2x2(c2, m2);

      const c3 = copy3x3(m3);
      assert3x3(c3, m3);

      const c4 = copy4x4(m4);
      assert4x4(c4, m4);
    });
    it("Should be a new object pointer", () => {
      const m2: Mat2x2 = [1, 2, 3, 4];
      const m3: Mat3x3 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const m4: Mat4x4 = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
      ];

      const c2 = copy2x2(m2);
      assert(c2 !== m2);

      const c3 = copy3x3(m3);
      assert(c3 !== m3);

      const c4 = copy4x4(m4);
      assert(c4 !== m4);
    });
  });
});
