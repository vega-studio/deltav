import assert from 'assert';
import { describe, it } from 'mocha';
import { apply2x2, apply3x3, apply4x4, compare2x2, compare3x3, compare4x4, identity2, identity3, identity4, Mat2x2, Mat3x3, Mat4x4, multiplyScalar2x2, multiplyScalar3x3, multiplyScalar4x4, rotation4x4, rotation4x4by3, scale4x4, scale4x4by3, toString2x2, toString3x3, toString4x4, translation4x4, translation4x4by3, transpose2x2, transpose3x3, transpose4x4 } from '../src/util/matrix';
import { Vec3 } from '../src/util/vector';

function fail2x2(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString2x2(actual)},\nEXPECTED: ${toString2x2(expected)}`;
}

function fail3x3(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString3x3(actual)},\nEXPECTED: ${toString3x3(expected)}`;
}

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(expected)}`;
}

function assert2x2(actual: Mat2x2, expected: Mat2x2, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare2x2(actual, expected), true, fail2x2(actual, expected));
  }

  else {
    assert.equal(!compare2x2(actual, expected), true, fail2x2(actual, expected));
  }
}

function assert3x3(actual: Mat3x3, expected: Mat3x3, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare3x3(actual, expected), true, fail3x3(actual, expected));
  }

  else {
    assert.equal(!compare3x3(actual, expected), true, fail3x3(actual, expected));
  }
}

function assert4x4(actual: Mat4x4, expected: Mat4x4, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare4x4(actual, expected), true, fail4x4(actual, expected));
  }

  else {
    assert.equal(!compare4x4(actual, expected), true, fail4x4(actual, expected));
  }
}

const TO_DEGREES = Math.PI / 180;

describe("Matrix Library", () => {
  // #region Compare
  describe('Compare', () => {
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
      ]
    ].forEach((t: Mat2x2[]) => {
      it ("Compare 2x2 matrices should be true", () => {
        assert2x2(t[0], t[1]);
      });
    });

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
      ]
    ].forEach((t: Mat2x2[]) => {
      it ("Compare 2x2 matrices should be false", () => {
        assert2x2(t[0], t[1], false);
      });
    });

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
    ].forEach((t: Mat3x3[]) => {
      it ("Compare 3x3 matrices should be true", () => {
        assert3x3(t[0], t[1]);
      });
    });

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
      ]
    ].forEach((t: Mat3x3[]) => {
      it ("Compare 3x3 matrices should be false", () => {
        assert3x3(t[0], t[1], false);
      });
    });

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
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 19, 20],
      ],
      ,
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
      ],
      [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 + 1e-11, 12, 13, 14, 15, 16],
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      ],
    ].forEach((t: Mat4x4[]) => {
      it ("Compare 4x4 matrices should be true", () => {
        assert4x4(t[0], t[1]);
      });
    });

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
    ].forEach((t: Mat4x4[]) => {
      it ("Compare 4x4 matrices should be false", () => {
        assert4x4(t[0], t[1], false);
      });
    });
  });
  // #endregion

  // #region Apply
  describe('Apply', () => {
    [
      [1, 2, 3, 4],
      [-1, 2, 3, 4],
      [1, 2, 3, 4, 5, 6]
    ].forEach(t => {
      it ("Should apply to 2x2 matrix", () => {
        const m: Mat2x2 = [0, 0, 0, 0];
        apply2x2(m, t[0], t[1], t[2], t[3]);
        assert2x2(m, t.slice(0, 4) as Mat2x2);
        assert.equal(m.length, 4);
      });
    });

    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      [-1, 2, 3, 4, 9, 8, 7, 6, 5],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    ].forEach(t => {
      it ("Should apply to 3x3 matrix", () => {
        const m: Mat3x3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        apply3x3(m, t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8]);
        assert3x3(m, t.slice(0, 9) as Mat3x3);
        assert.equal(m.length, 9);
      });
    });

    [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      [-1, 2, 3, 4, 9, 8, 7, 6, 5, 10, 11, 12, 13, 14, 15, 16],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
    ].forEach(t => {
      it ("Should apply to 4x4 matrix", () => {
        const m: Mat4x4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        apply4x4(m, t[0], t[1], t[2], t[3], t[4], t[5], t[6], t[7], t[8], t[9], t[10], t[11], t[12], t[13], t[14], t[15]);
        assert4x4(m, t.slice(0, 16) as Mat4x4);
        assert.equal(m.length, 16);
      });
    });
  });
  // #endregion

  describe('Identity', () => {
    it("Should make identity 2x2", () => {
      const m = identity2();
      assert2x2(m, [1, 0, 0, 1]);
    });

    it("Should modify to identity 2x2", () => {
      const m: Mat2x2 = [9, 9, 9, 9];
      identity2(m);
      assert2x2(m, [1, 0, 0, 1]);
    });

    it("Should make identity 3x3", () => {
      const m = identity3();
      assert3x3(m, [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it("Should modify to identity 3x3", () => {
      const m: Mat3x3 = [9, 9, 9, 9, 9, 9, 9, 9, 9];
      identity3(m);
      assert3x3(m, [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
      ]);
    });

    it("Should make identity 4x4", () => {
      const m = identity4();
      assert4x4(m, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    });

    it("Should modify to identity 4x4", () => {
      const m: Mat4x4 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
      identity4(m);
      assert4x4(m, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    });
  });

  describe('Transpose', () => {
    it ('Should transpose 2x2 matrix', () => {
      const m = transpose2x2([
        1, 2,
        3, 4,
      ]);

      assert2x2(m, [
        1, 3,
        2, 4
      ]);
    });

    it ('Should convert to a transposed 2x2 matrix', () => {
      const m: Mat2x2 = [
        1, 2,
        3, 4,
      ];
      transpose2x2(m, m);

      assert2x2(m, [
        1, 3,
        2, 4
      ]);
    });

    it ('Should transpose 3x3 matrix', () => {
      const m = transpose3x3([
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      ]);

      assert3x3(m, [
        1, 4, 7,
        2, 5, 8,
        3, 6, 9,
      ]);
    });

    it ('Should convert to a transposed 3x3 matrix', () => {
      const m: Mat3x3 = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      ];
      transpose3x3(m, m);

      assert3x3(m, [
        1, 4, 7,
        2, 5, 8,
        3, 6, 9,
      ]);
    });

    it ('Should transpose 4x4 matrix', () => {
      const m = transpose4x4([
        1,  2,  3,  4,
        5,  6,  7,  8,
        9, 10, 11, 12,
        13, 14, 15, 16,
      ]);

      assert4x4(m, [
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16,
      ]);
    });

    it ('Should convert to a transposed 4x4 matrix', () => {
      const m: Mat4x4 = [
        1,  2,  3,  4,
        5,  6,  7,  8,
        9, 10, 11, 12,
        13, 14, 15, 16,
      ];
      transpose4x4(m, m);

      assert4x4(m, [
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16,
      ]);
    });
  });

  describe('Translation', () => {
    it ('Should create a 4x4 translation marix', () => {
      const m = translation4x4(1, 2, 3);
      assert4x4(m, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 2, 3, 1
      ]);
    });

    it ('Should modify to become a 4x4 translation marix', () => {
      const m = identity4();
      translation4x4(1, 2, 3, m);
      assert4x4(m, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 2, 3, 1
      ]);
    });

    it ('Should create a 4x4 translation marix from a Vec3', () => {
      const v: Vec3 = [1, 2, 3];
      const m = translation4x4by3(v);
      assert4x4(m, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 2, 3, 1
      ]);
    });

    it ('Should modify to become 4x4 translation marix from a Vec3', () => {
      const v: Vec3 = [1, 2, 3];
      const m = identity4();
      translation4x4by3(v, m);
      assert4x4(m, [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1, 2, 3, 1
      ]);
    });
  });

  describe('Scale', () => {
    it ('Should create a 4x4 scale marix', () => {
      const m = scale4x4(1, 2, 3);

      assert4x4(m, [
        1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1
      ]);
    });

    it ('Should modify to become a 4x4 scale marix', () => {
      const m = identity4();
      scale4x4(1, 2, 3, m);

      assert4x4(m, [
        1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1
      ]);
    });

    it ('Should create a 4x4 scale marix from a Vec3', () => {
      const v: Vec3 = [1, 2, 3];
      const m = scale4x4by3(v);

      assert4x4(m, [
        1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1
      ]);
    });

    it ('Should modify to become 4x4 scale marix from a Vec3', () => {
      const v: Vec3 = [1, 2, 3];
      const m = identity4();
      scale4x4by3(v, m);
      assert4x4(m, [
        1, 0, 0, 0,
        0, 2, 0, 0,
        0, 0, 3, 0,
        0, 0, 0, 1
      ]);
    });
  });

  describe('Rotation', () => {
    it ('Should produce an identity matrix', () => {
      const m = rotation4x4(0, 0, 0);
      assert4x4(m, identity4());
    });

    it ('Should modify to become an identity matrix', () => {
      const m: Mat4x4 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
      rotation4x4(0, 0, 0, m);
      assert4x4(m, identity4());
    });

    it ('Should produce an identity matrix from Vec3', () => {
      const m = rotation4x4by3([0, 0, 0]);
      assert4x4(m, identity4());
    });

    it ('Should modify to become an identity matrix from Vec3', () => {
      const m: Mat4x4 = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9];
      rotation4x4by3([0, 0, 0], m);
      assert4x4(m, identity4());
    });

    // #region arbitrary greater than 360 degrees
    it ('Should be a 491 degree rotation about the x-axis', () => {
      const m = rotation4x4(491 * TO_DEGREES, 0, 0);

      assert4x4(m, transpose4x4([
        1.0000000,  0.0000000,  0.0000000, 0,
        0.0000000, -0.6560590, -0.7547096, 0,
        0.0000000,  0.7547096, -0.6560590, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 491 degree rotation about the y-axis', () => {
      const m = rotation4x4(0, 491 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        -0.6560590,  0.0000000,  0.7547096, 0,
        0.0000000,  1.0000000,  0.0000000, 0,
        -0.7547096,  0.0000000, -0.6560590, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 491 degree rotation about the z-axis', () => {
      const m = rotation4x4(0, 0, 491 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        -0.6560590, -0.7547096,  0.0000000, 0,
        0.7547096, -0.6560590,  0.0000000, 0,
        0.0000000,  0.0000000,  1.0000000, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 491 degree rotation about the xy-axis', () => {
      const m = rotation4x4(491 * TO_DEGREES, 491 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        -0.6560590,  0.0000000,  0.7547096, 0,
        0.5695866, -0.6560590,  0.4951340, 0,
        0.4951340,  0.7547096,  0.4304135, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 491 degree rotation about the xz-axis', () => {
      const m = rotation4x4(491 * TO_DEGREES, 0, 491 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        -0.6560590, -0.7547096, -0.0000000, 0,
        -0.4951340,  0.4304135, -0.7547096, 0,
        0.5695866, -0.4951340, -0.6560590, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 491 degree rotation about the yz-axis', () => {
      const m = rotation4x4(0, 491 * TO_DEGREES, 491 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.4304135,  0.4951340,  0.7547096, 0,
        0.7547096, -0.6560590, -0.0000000, 0,
        0.4951340,  0.5695866, -0.6560590, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 491 degree rotation about the xyz-axis', () => {
      const m = rotation4x4(491 * TO_DEGREES, 491 * TO_DEGREES, 491 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.4304135,  0.4951340,  0.7547096, 0,
        -0.8688164,  0.0005410,  0.4951340, 0,
        0.2447494, -0.8688164,  0.4304135, 0,
        0, 0, 0, 1
      ]));
    });
    // #endregion

    // #region 360 degrees
    it ('Should be a 360 degree rotation about the x-axis', () => {
      const m = rotation4x4(360 * TO_DEGREES, 0, 0);

      assert4x4(m, identity4());
    });

    it ('Should be a 360 degree rotation about the y-axis', () => {
      const m = rotation4x4(0, 360 * TO_DEGREES, 0);

      assert4x4(m, identity4());
    });

    it ('Should be a 360 degree rotation about the z-axis', () => {
      const m = rotation4x4(0, 0, 360 * TO_DEGREES);

      assert4x4(m, identity4());
    });

    it ('Should be a 360 degree rotation about the xy-axis', () => {
      const m = rotation4x4(360 * TO_DEGREES, 360 * TO_DEGREES, 0);

      assert4x4(m, identity4());
    });

    it ('Should be a 360 degree rotation about the xz-axis', () => {
      const m = rotation4x4(360 * TO_DEGREES, 0, 360 * TO_DEGREES);

      assert4x4(m, identity4());
    });

    it ('Should be a 360 degree rotation about the yz-axis', () => {
      const m = rotation4x4(0, 360 * TO_DEGREES, 360 * TO_DEGREES);

      assert4x4(m, identity4());
    });

    it ('Should be a 360 degree rotation about the xyz-axis', () => {
      const m = rotation4x4(360 * TO_DEGREES, 360 * TO_DEGREES, 360 * TO_DEGREES);

      assert4x4(m, identity4());
    });
    // #endregion

    // #region 180 degrees
    it ('Should be a 180 degree rotation about the x-axis', () => {
      const m = rotation4x4(180 * TO_DEGREES, 0, 0);

      assert4x4(m, transpose4x4([
        1,  0, 0, 0,
        0,  -1, 0, 0,
        0,  0, -1, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 180 degree rotation about the y-axis', () => {
      const m = rotation4x4(0, 180 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        -1,  0, 0, 0,
        0,  1, 0, 0,
        0,  0, -1, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 180 degree rotation about the z-axis', () => {
      const m = rotation4x4(0, 0, 180 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        -1,  0, 0, 0,
        0,  -1, 0, 0,
        0,  0, 1, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 180 degree rotation about the xy-axis', () => {
      const m = rotation4x4(180 * TO_DEGREES, 180 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        -1,  0, 0, 0,
        0,  -1, 0, 0,
        0,  0, 1, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 180 degree rotation about the xz-axis', () => {
      const m = rotation4x4(180 * TO_DEGREES, 0, 180 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        -1,  0, 0, 0,
        0,  1, 0, 0,
        0,  0, -1, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 180 degree rotation about the yz-axis', () => {
      const m = rotation4x4(0, 180 * TO_DEGREES, 180 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        1,  0, 0, 0,
        0,  -1, 0, 0,
        0,  0, -1, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 180 degree rotation about the xyz-axis', () => {
      const m = rotation4x4(180 * TO_DEGREES, 180 * TO_DEGREES, 180 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        1,  0, 0, 0,
        0,  1, 0, 0,
        0,  0, 1, 0,
        0, 0, 0, 1
      ]));
    });
    // #endregion

    // #region 90 degrees
    it ('Should be a 90 degree rotation about the x-axis', () => {
      const m = rotation4x4(90 * TO_DEGREES, 0, 0);

      assert4x4(m, [
        1, 0, 0, 0,
        0, 0, 1, 0,
        0, -1, 0, 0,
        0, 0, 0, 1
      ]);
    });

    it ('Should be a 90 degree rotation about the y-axis', () => {
      const m = rotation4x4(0, 90 * TO_DEGREES, 0);

      assert4x4(m, [
        0, 0, -1, 0,
        0, 1, 0, 0,
        1, 0, 0, 0,
        0, 0, 0, 1
      ]);
    });

    it ('Should be a 90 degree rotation about the z-axis', () => {
      const m = rotation4x4(0, 0, 90 * TO_DEGREES);

      assert4x4(m, [
        0, 1, 0, 0,
        -1, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      ]);
    });

    it ('Should be a 90 degree rotation about the xy-axis', () => {
      const m = rotation4x4(90 * TO_DEGREES, 90 * TO_DEGREES, 0);

      assert4x4(m, [
        0,  1,  0, 0,
        0,  0, 1, 0,
        1,  0,  0,  0,
        0, 0, 0, 1
      ]);
    });

    it ('Should be a 90 degree rotation about the xz-axis', () => {
      const m = rotation4x4(90 * TO_DEGREES, 0, 90 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0, -1,  0, 0,
        0,  0, -1, 0,
        1,  0,  0,  0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 90 degree rotation about the yz-axis', () => {
      const m = rotation4x4(0, 90 * TO_DEGREES, 90 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0, -0,  1, 0,
        1,  0,  0, 0,
        -0,  1,  0,  0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 90 degree rotation about the xyz-axis', () => {
      const m = rotation4x4(90 * TO_DEGREES, 90 * TO_DEGREES, 90 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        -0, -0, 1, 0,
        0, -1, -0, 0,
        1,  0, -0,  0,
        0, 0, 0, 1
      ]));
    });
    // #endregion

    // #region 45 degrees
    it ('Should be a 45 degree rotation about the x-axis', () => {
      const m = rotation4x4(45 * TO_DEGREES, 0, 0);

      assert4x4(m, transpose4x4([
        1,  0,  0, 0,
        0,  0.7071068, -0.7071068, 0,
        0,  0.7071068,  0.7071068, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 45 degree rotation about the y-axis', () => {
      const m = rotation4x4(0, 45 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        0.7071068,  0,  0.7071068, 0,
        0,  1,  0, 0,
        -0.7071068,  0,  0.7071068, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 45 degree rotation about the z-axis', () => {
      const m = rotation4x4(0, 0, 45 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.7071068, -0.7071068, 0, 0,
        0.7071068,  0.7071068, 0, 0,
        0,  0,  1, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 45 degree rotation about the xy-axis', () => {
      const m = rotation4x4(45 * TO_DEGREES, 45 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        0.7071068,  0,  0.7071068, 0,
        0.5,  0.7071068, -0.5, 0,
       -0.5,  0.7071068,  0.5,  0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 45 degree rotation about the xz-axis', () => {
      const m = rotation4x4(45 * TO_DEGREES, 0, 45 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.7071068, -0.7071068, 0, 0,
        0.5,  0.5, -0.7071068, 0,
        0.5,  0.5,  0.7071068,  0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 45 degree rotation about the yz-axis', () => {
      const m = rotation4x4(0, 45 * TO_DEGREES, 45 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.5, -0.5,  0.7071068, 0,
        0.7071068,  0.7071068,  0, 0,
        -0.5,  0.5,  0.7071068,  0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 45 degree rotation about the xyz-axis', () => {
      const m = rotation4x4(45 * TO_DEGREES, 45 * TO_DEGREES, 45 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.5, -0.5,  0.7071068, 0,
        0.8535534,  0.1464466, -0.5, 0,
        0.1464466,  0.8535534,  0.5,  0,
        0, 0, 0, 1
      ]));
    });
    // #endregion

    // #region arbitrary degrees
    it ('Should be a 53 degree rotation about the x-axis', () => {
      const m = rotation4x4(53 * TO_DEGREES, 0, 0);

      assert4x4(m, transpose4x4([
        1.0000000,  0.0000000,  0.0000000, 0,
        0.0000000,  0.6018150, -0.7986355, 0,
        0.0000000,  0.7986355,  0.6018150, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 53 degree rotation about the y-axis', () => {
      const m = rotation4x4(0, 53 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        0.6018150,  0.0000000,  0.7986355, 0,
        0.0000000,  1.0000000,  0.0000000, 0,
        -0.7986355,  0.0000000,  0.6018150, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 53 degree rotation about the z-axis', () => {
      const m = rotation4x4(0, 0, 53 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.6018150, -0.7986355,  0.0000000, 0,
        0.7986355,  0.6018150,  0.0000000, 0,
        0.0000000,  0.0000000,  1.0000000, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 53 degree rotation about the xy-axis', () => {
      const m = rotation4x4(53 * TO_DEGREES, 53 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        0.6018150,  0.0000000,  0.7986355, 0,
        0.6378187,  0.6018150, -0.4806308, 0,
        -0.4806308,  0.7986355,  0.3621813, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 53 degree rotation about the xz-axis', () => {
      const m = rotation4x4(53 * TO_DEGREES, 0, 53 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.6018150, -0.7986355,  0.0000000, 0,
        0.4806308,  0.3621813, -0.7986355, 0,
        0.6378187,  0.4806308,  0.6018150, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 53 degree rotation about the yz-axis', () => {
      const m = rotation4x4(0, 53 * TO_DEGREES, 53 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.3621813, -0.4806308,  0.7986355, 0,
        0.7986355,  0.6018150,  0.0000000, 0,
        -0.4806308,  0.6378187,  0.6018150, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a 53 degree rotation about the xyz-axis', () => {
      const m = rotation4x4(53 * TO_DEGREES, 53 * TO_DEGREES, 53 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.3621813, -0.4806308,  0.7986355, 0,
        0.8644797, -0.1472033, -0.4806308, 0,
        0.3485678,  0.8644797,  0.3621813, 0,
        0, 0, 0, 1
      ]));
    });
    // #endregion

    // #region negative degrees
    it ('Should be a -51 degree rotation about the x-axis', () => {
      const m = rotation4x4(-51 * TO_DEGREES, 0, 0);

      assert4x4(m, transpose4x4([
        1.0000000,  0.0000000,  0.0000000, 0,
        0.0000000,  0.6293204,  0.7771460, 0,
        0.0000000, -0.7771460,  0.6293204, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a -51 degree rotation about the y-axis', () => {
      const m = rotation4x4(0, -51 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        0.6293204,  0.0000000, -0.7771460, 0,
        0.0000000,  1.0000000,  0.0000000, 0,
        0.7771460,  0.0000000,  0.6293204, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a -51 degree rotation about the z-axis', () => {
      const m = rotation4x4(0, 0, -51 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.6293204,  0.7771460,  0.0000000, 0,
        -0.7771460,  0.6293204,  0.0000000, 0,
        0.0000000,  0.0000000,  1.0000000, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a -51 degree rotation about the xy-axis', () => {
      const m = rotation4x4(-51 * TO_DEGREES, -51 * TO_DEGREES, 0);

      assert4x4(m, transpose4x4([
        0.6293204,  0.0000000, -0.7771460, 0,
        0.6039559,  0.6293204,  0.4890738, 0,
        0.4890738, -0.7771460,  0.3960442, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a -51 degree rotation about the xz-axis', () => {
      const m = rotation4x4(-51 * TO_DEGREES, 0, -51 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.6293204,  0.7771460,  0.0000000, 0,
        -0.4890738,  0.3960442,  0.7771460, 0,
        0.6039559, -0.4890738,  0.6293204, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a -51 degree rotation about the yz-axis', () => {
      const m = rotation4x4(0, -51 * TO_DEGREES, -51 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.3960442,  0.4890738, -0.7771460, 0,
        -0.7771460,  0.6293204,  0.0000000, 0,
        0.4890738,  0.6039559,  0.6293204, 0,
        0, 0, 0, 1
      ]));
    });

    it ('Should be a -51 degree rotation about the xyz-axis', () => {
      const m = rotation4x4(-51 * TO_DEGREES, -51 * TO_DEGREES, -51 * TO_DEGREES);

      assert4x4(m, transpose4x4([
        0.3960442,  0.4890738, -0.7771460, 0,
        -0.1089921,  0.8654060,  0.4890738, 0,
        0.9117399, -0.1089921,  0.3960442, 0,
        0, 0, 0, 1
      ]));
    });
    // #endregion
  });

  describe('Scalar', () => {
    it ('Should scale all 2x2 items by a scalar', () => {
      const m: Mat2x2 = [
        1, 2,
        3, 4
      ];
      const t = multiplyScalar2x2(m, 5);
      assert2x2(t, [
        5, 10,
        15, 20,
      ]);
    });

    it ('Should scale all 2x2 items by a scalar and apply', () => {
      const m: Mat2x2 = [
        1, 2,
        3, 4
      ];
      multiplyScalar2x2(m, 5, m);
      assert2x2(m, [
        5, 10,
        15, 20,
      ]);
    });

    it ('Should scale all 3x3 items by a scalar', () => {
      const m: Mat3x3 = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      ];
      const t = multiplyScalar3x3(m, 5);
      assert3x3(t, [
        5, 10, 15,
        20, 25, 30,
        35, 40, 45
      ]);
    });

    it ('Should scale all 3x3 items by a scalar and apply', () => {
      const m: Mat3x3 = [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      ];
      multiplyScalar3x3(m, 5, m);
      assert3x3(m, [
        5, 10, 15,
        20, 25, 30,
        35, 40, 45
      ]);
    });

    it ('Should scale all 4x4 items by a scalar', () => {
      const m: Mat4x4 = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ];
      const t = multiplyScalar4x4(m, 5);
      assert4x4(t, [
        5, 10, 15, 20,
        25, 30, 35, 40,
        45, 50, 55, 60,
        65, 70, 75, 80
      ]);
    });

    it ('Should scale all 4x4 items by a scalar and apply', () => {
      const m: Mat4x4 = [
        1, 2, 3, 4,
        5, 6, 7, 8,
        9, 10, 11, 12,
        13, 14, 15, 16
      ];
      multiplyScalar4x4(m, 5, m);
      assert4x4(m, [
        5, 10, 15, 20,
        25, 30, 35, 40,
        45, 50, 55, 60,
        65, 70, 75, 80
      ]);
    });
  });
});
