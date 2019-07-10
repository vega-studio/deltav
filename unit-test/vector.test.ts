import assert from 'assert';
import { describe, it } from 'mocha';
import { normalize } from 'path';
import { add1, add2, add3, add4, ceil1, ceil2, ceil3, ceil4, compare1, compare2, compare3, compare4, copy1, copy2, copy3, copy4, cross1, cross2, cross3, cross4, divide1, divide2, divide3, divide4, dot1, dot2, dot3, dot4, flatten1, flatten2, flatten3, flatten4, floor1, floor2, floor3, floor4, inverse1, inverse2, inverse3, inverse4, linear1, linear2, linear3, linear4, max1, max2, max3, max4, min1, min2, min3, min4, multiply1, multiply2, multiply3, multiply4, normalize1, normalize2, normalize3, normalize4, scale1, scale2, scale3, scale4, toString1, toString2, toString3, toString4, Vec1, Vec1Compat, Vec2, Vec2Compat, Vec3, Vec3Compat, Vec4, Vec4Compat } from '../src/math/vector';

export function fail1(actual: Vec1, expected: Vec1): string {
  return `\n\nACTUAL: ${toString1(actual)}\nEXPECTED: ${toString1(expected)}`;
}

export function fail2(actual: Vec2Compat, expected: Vec2Compat): string {
  return `\n\nACTUAL: ${toString2(actual)}\nEXPECTED: ${toString2(expected)}`;
}

export function fail3(actual: Vec3Compat, expected: Vec3Compat): string {
  return `\n\nACTUAL: ${toString3(actual)}\nEXPECTED: ${toString3(expected)}`;
}

export function fail4(actual: Vec4Compat, expected: Vec4Compat): string {
  return `\n\nACTUAL: ${toString4(actual)}\nEXPECTED: ${toString4(expected)}`;
}

function arrayToString(array: number[]): string {
  let result = "[";

  for (let i = 0; i < array.length; i++) {
    if (i !== array.length - 1) {
      result += `${array[i]}, `;
    } else {
      result += `${array[i]}`;
    }
  }

  result += "]";

  return result;
}

export function failArray(actual: number[], expected: number[]): string {
  const actualString: string = arrayToString(actual);
  const expectedString: string = arrayToString(expected);

  return `\n\nACTUAL: ${actualString}\nEXPECTED: ${expectedString}`;
}

function fuzzCompare1(v1: Vec1, v2: Vec1): boolean {
  return Math.abs(v1[0] - v2[0]) <= 1e-7;
}

function fuzzCompare2(v1: Vec2, v2: Vec2): boolean {
  return (
    Math.abs(v1[0] - v2[0]) <= 1e-7 &&
    Math.abs(v1[1] - v2[1]) <= 1e-7
  );
}

function fuzzCompare3(v1: Vec3, v2: Vec3): boolean {
  return (
    Math.abs(v1[0] - v2[0]) <= 1e-7 &&
    Math.abs(v1[1] - v2[1]) <= 1e-7 &&
    Math.abs(v1[2] - v2[2]) <= 1e-7
  );
}

function fuzzCompare4(v1: Vec4, v2: Vec4): boolean {
  return (
    Math.abs(v1[0] - v2[0]) <= 1e-7 &&
    Math.abs(v1[1] - v2[1]) <= 1e-7 &&
    Math.abs(v1[2] - v2[2]) <= 1e-7 &&
    Math.abs(v1[3] - v2[3]) <= 1e-7
  );
}

function assert1(actual: Vec1, expected: Vec1, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare1(actual, expected), true, fail1(actual, expected));
  }

  else {
    assert.equal(!compare1(actual, expected), true, fail1(actual, expected));
  }
}

function assert2(actual: Vec2, expected: Vec2, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare2(actual, expected), true, fail2(actual, expected));
  }

  else {
    assert.equal(!compare2(actual, expected), true, fail2(actual, expected));
  }
}

function assert3(actual: Vec3, expected: Vec3, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare3(actual, expected), true, fail3(actual, expected));
  }

  else {
    assert.equal(!compare3(actual, expected), true, fail3(actual, expected));
  }
}

function assert4(actual: Vec4, expected: Vec4, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare4(actual, expected), true, fail4(actual, expected));
  }

  else {
    assert.equal(!compare4(actual, expected), true, fail4(actual, expected));
  }
}

function fuzzyAssert1(actual: Vec1, expected: Vec1, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzCompare1(actual, expected), true, fail1(actual, expected));
  }

  else {
    assert.equal(!fuzzCompare1(actual, expected), true, fail1(actual, expected));
  }
}

function fuzzyAssert2(actual: Vec2, expected: Vec2, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzCompare2(actual, expected), true, fail2(actual, expected));
  }

  else {
    assert.equal(!fuzzCompare2(actual, expected), true, fail2(actual, expected));
  }
}

function fuzzyAssert3(actual: Vec3, expected: Vec3, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzCompare3(actual, expected), true, fail3(actual, expected));
  }

  else {
    assert.equal(!fuzzCompare3(actual, expected), true, fail3(actual, expected));
  }
}

function fuzzyAssert4(actual: Vec4, expected: Vec4, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzCompare4(actual, expected), true, fail4(actual, expected));
  }

  else {
    assert.equal(!fuzzCompare4(actual, expected), true, fail4(actual, expected));
  }
}

function compareArray(actual: number[], expected: number[]) {
  const length = Math.min(actual.length, expected.length);

  for (let i = 0; i < length; i++) {
    if (actual[i] !== expected[i]) return false;
  }

  return true;
}

function assertArray(actual: number[], expected: number[], shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compareArray(actual, expected), true, failArray(actual, expected));
  }

  else {
    assert.equal(compareArray(actual, expected), false, failArray(actual, expected));
  }
}

describe('Vector Library', () => {
  describe('Compare', () => {
    [
      [
        [1],
        [1],
      ],
      [
        [1],
        [1, 2]
      ],
      [
        [1],
        [1, 2, 3]
      ],
      [
        [1],
        [1, 2, 3, 4]
      ],
      [
        [1, 2],
        [1, 3]
      ],
      [
        [1, 2],
        [1, 3, 4]
      ],
      [
        [1, 2],
        [1, 4, 6]
      ],
      [
        [1, 2],
        [1, 3, 4, 5]
      ],
      [
        [1, 2, 3],
        [1, 5, 6]
      ],
      [
        [1, 2, 3],
        [1, 3, 4, 7]
      ],
      [
        [1, 2, 3, 8],
        [1, 3, 4, 7]
      ]
    ].forEach((t: Vec1[]) => {
      it ("Compare vector1 should be true", () => {
        assert1(t[0], t[1]);
      });
    });

    [
      [
        [1],
        [2],
      ],
      [
        [1],
        [3, 2]
      ],
      [
        [1],
        [4, 2, 3]
      ],
      [
        [1],
        [6, 2, 3, 4]
      ],
      [
        [1, 2],
        [7, 3]
      ],
      [
        [1, 2],
        [3, 3, 4]
      ],
      [
        [1, 2],
        [2, 4, 6]
      ],
      [
        [1, 2],
        [4, 3, 4, 5]
      ],
      [
        [1, 2, 3],
        [2, 5, 6]
      ],
      [
        [1, 2, 3],
        [6, 3, 4, 7]
      ],
      [
        [1, 2, 3, 9],
        [6, 3, 4, 7]
      ],
    ].forEach((t: Vec1[]) => {
      it ("Compare vector1 should be false", () => {
        assert1(t[0], t[1], false);
      });
    });

    [
      [
        [1, 2],
        [1, 2]
      ],
      [
        [1, 2],
        [1, 2, 3]
      ],
      [
        [1, 2],
        [1, 2, 3, 4]
      ],
      [
        [1, 2, 3],
        [1, 2, 4]
      ],
      ,
      [
        [1, 2, 3],
        [1, 2, 4, 5]
      ],
      [
        [1, 2, 3, 9],
        [1, 2, 4, 7]
      ],
    ].forEach((t: Vec2[]) => {
      it ("Compare vector2 should be true", () => {
        assert2(t[0], t[1]);
      });
    });

    [
      [
        [1, 2],
        [2, 2]
      ],
      [
        [1, 2],
        [2, 3]
      ],
      [
        [1, 3],
        [1, 2]
      ],
      [
        [1, 2],
        [4, 3, 3]
      ],
      [
        [1, 3],
        [1, 2, 3, 4]
      ],
      [
        [1, 2, 3],
        [9, 2, 4]
      ],
      ,
      [
        [5, 2, 3],
        [1, 6, 4, 5]
      ],
      [
        [4, 2, 3, 9],
        [1, 3, 4, 7]
      ],
    ].forEach((t: Vec2[]) => {
      it ("Compare vector2 should be false", () => {
        assert2(t[0], t[1], false);
      });
    });

    [
      [
        [1, 2, 3],
        [1, 2, 3]
      ],
      [
        [1, 2, 3],
        [1, 2, 3, 5]
      ],
      [
        [1, 2, 3, 9],
        [1, 2, 3, 7]
      ],
    ].forEach((t: Vec3[]) => {
      it ("Compare vector2 should be true", () => {
        assert3(t[0], t[1]);
      });
    });

    [
      [
        [1, 2, 3],
        [9, 2, 4]
      ],
      [
        [5, 2, 3],
        [1, 6, 4, 5]
      ],
      [
        [4, 2, 3, 9],
        [1, 3, 4, 7]
      ],
    ].forEach((t: Vec3[]) => {
      it ("Compare vector2 should be false", () => {
        assert3(t[0], t[1], false);
      });
    });

    [
      [
        [1, 2, 3, 5],
        [1, 2, 3, 5]
      ],
      [
        [1, 2, 3, 7],
        [1, 2, 3, 7, 9]
      ],
    ].forEach((t: Vec4[]) => {
      it ("Compare vector2 should be true", () => {
        assert4(t[0], t[1]);
      });
    });

    [
      [
        [5, 2, 3, 6],
        [1, 6, 4, 5]
      ],
      [
        [4, 2, 3, 9],
        [1, 3, 4, 7, 9]
      ],
    ].forEach((t: Vec4[]) => {
      it ("Compare vector2 should be false", () => {
        assert4(t[0], t[1], false);
      });
    });
  });

  describe('Add', () => {
    [
      [
        [1],
        [2],
      ],
      [
        [1],
        [2, 3],
      ],
      [
        [1, 3],
        [2, 4, 6],
      ],
      [
        [1, 2, 5],
        [2, 3, 6, 7]
      ]
    ].forEach((t: Vec1Compat[]) => {
      it("Add vector1 should be true", () => {
        assert1(add1(t[0], t[1]), [3]);
      });
    });

    [
      [
        [1, 4],
        [2, 3],
      ],
      [
        [1, 4],
        [2, 3, 6],
      ],
      [
        [1, 4, 5],
        [2, 3, 6, 7]
      ]
    ].forEach((t: Vec2Compat[]) => {
      it("Add vector2 should be true", () => {
        assert2(add2(t[0], t[1]), [3, 7]);
      });
    });

    [
      [
        [1, 4, 7],
        [2, 3, 6],
      ],
      [
        [1, 4, 7],
        [2, 3, 6, 7]
      ],
      [
        [1, 4, 7, 9],
        [2, 3, 6, 7]
      ]
    ].forEach((t: Vec3Compat[]) => {
      it("Add vector3 should be true", () => {
        assert3(add3(t[0], t[1]), [3, 7, 13]);
      });
    });

    [
      [
        [1, 4, 7, 9],
        [2, 3, 6, 7]
      ],
      [
        [1, 4, 7, 9],
        [2, 3, 6, 7, 8]
      ]
    ].forEach((t: Vec4Compat[]) => {
      it("Add vector4 should be true", () => {
        assert4(add4(t[0], t[1]), [3, 7, 13, 16]);
     });
   });
  });

  describe("Ceil", () => {
    [
      [1],
      [0.6],
      [0.7, 1.2],
      [0.01],
      [1e-11]
    ].forEach((t: Vec1Compat) => {
      it("Ceil Vector1 should be true", () => {
        assert1(ceil1(t), [1]);
      });
    });

    it("Ceil Vector1 should be false", () => {
      assert1(ceil1([1]), [2], false);
    });

    [
      [1, 2],
      [0.6, 1.7],
      [0.7, 1.2, 3],
      [0.01, 1.0001],
      [1e-11, 1 + 1e-13]
    ].forEach((t: Vec2Compat) => {
      it("Ceil Vector2 should be true", () => {
        assert2(ceil2(t), [1, 2]);
      });
    });

    [
      [0, 1],
      [1, 1],
      [0, 2]
    ].forEach((t: Vec2Compat) => {
      it("Ceil Vector2 should be false", () => {
        assert2(ceil2(t), [1, 2], false);
      });
    });

    [
      [1, 2, 3],
      [0.6, 1.7, 2.3],
      [0.7, 1.2, 3],
      [0.01, 2, 2.0001],
      [0.009, 1 + 1e-11, 2 + 1e-13]
    ].forEach((t: Vec3Compat) => {
      it("Ceil Vector3 should be true", () => {
        assert3(ceil3(t), [1, 2, 3]);
      });
    });

    [
      [1, 2, 3],
      [1.1, 2, 3],
      [1, 2.2, 3],
      [1, 2, 3.3]
    ].forEach((t: Vec3Compat) => {
      it("Ceil Vector3 should be false", () => {
        assert3(ceil3(t), [2, 3, 4], false);
      });
    });

    [
      [1, 2, 3, 4],
      [0.6, 1.7, 2.3, 3.5],
      [0.7, 1.2, 3, 4],
      [1, 2, 2.0001, 3.1],
      [0.009, 1 + 1e-11, 2 + 1e-13, 3 + 1e-14]
    ].forEach((t: Vec4Compat) => {
      it("Ceil Vector4 should be true", () => {
        assert4(ceil4(t), [1, 2, 3, 4]);
      });
    });

    [
      [1, 2, 3, 4],
      [1.1, 2, 3, 4],
      [1, 2.2, 3, 4],
      [1, 2, 3.3, 4],
      [1, 2, 3, 4.5]
    ].forEach((t: Vec4Compat) => {
      it("Ceil Vector4 should be false", () => {
        assert4(ceil4(t), [2, 3, 4, 5], false);
      });
    });
  });

  describe("Copy", () => {
    [
      [1],
      [1, 2],
      [1, 2, 3],
      [1, 2, 3, 4]
    ].forEach((t: Vec1Compat) => {
      it("Copy Vector1 should be true", () => {
        assert1(copy1(t), [1]);
      });
    });

    [
      [1, 2],
      [1, 2, 3],
      [1, 2, 3, 4]
    ].forEach((t: Vec2Compat) => {
      it("Copy Vector2 should be true", () => {
        assert2(copy2(t), [1, 2]);
      });
    });

    [
      [1, 2, 3],
      [1, 2, 3, 4]
    ].forEach((t: Vec3Compat) => {
      it("Copy Vector3 should be true", () => {
        assert3(copy3(t), [1, 2, 3]);
      });
    });

    [
      [1, 2, 3, 4]
    ].forEach((t: Vec4Compat) => {
      it("Copy Vector4 should be true", () => {
        assert4(copy4(t), [1, 2, 3, 4]);
      });
    });
  });

  describe("Cross", () => {
    it("Cross Vector1 should be correct", () => {
      assert1(cross1([1], [2]), [0]);
    });

    it("Cross Vector2 should be correct", () => {
      assert2(cross2([1, 1], [2, 3]), [0, 0]);
    });

    it("Cross Vector3 should be correct", () => {
      assert3(cross3([2, 3, 4], [5, 6, 7]), [-3, 6, -3]);
    });

    it("Cross Vector4 should be correct", () => {
      assert4(cross4([2, 3, 4, 5], [5, 6, 7, 9]), [0, 0, 0, 1]);
    });
  });

  describe("Divide", () => {
    it("Divide vector1 should be correct", () => {
      assert1(divide1([5], [2]), [2.5]);
    });

    it("Divide vector1 should be correct", () => {
      assert1(divide1([5], [-2]), [-2.5]);
    });

    it("Divide vector1 should be correct", () => {
      assert1(divide1([6], [2]), [3]);
    });

    it("Divide vector1 should be correct", () => {
      assert1(divide1([5], [0]), [Infinity]);
    });

    it("Divide vector1 should be correct", () => {
      assert1(divide1([5], [-0]), [-Infinity]);
    });

    it("Divide vector1 should be correct", () => {
      assert1(divide1([-5], [0]), [-Infinity]);
    });

    it("Divide vector2 should be correct", () => {
      assert2(divide2([5, 6], [2, 2]), [2.5, 3]);
    });

    it("Divide vector2 should be correct", () => {
      assert2(divide2([5, 6], [0, 2]), [Infinity, 3]);
    });

    it("Divide vector2 should be correct", () => {
      assert2(divide2([5, 6], [-2, -0]), [-2.5, -Infinity]);
    });

    it("Divide vector3 should be correct", () => {
      assert3(divide3([5, 6, 9], [2, 2, 3]), [2.5, 3, 3]);
    });

    it("Divide vector3 should be correct", () => {
      assert3(divide3([5, 6, 4], [0, 2, 3]), [Infinity, 3, 4 / 3]);
    });

    it("Divide vector3 should be correct", () => {
      assert3(divide3([5, 6, 3], [-2, -0, 7]), [-2.5, -Infinity, 3 / 7]);
    });

    it("Divide vector4 should be correct", () => {
      assert4(divide4([5, 6, 9, 16], [2, 2, 3, 4]), [2.5, 3, 3, 4]);
    });

    it("Divide vector4 should be correct", () => {
      assert4(divide4([5, 6, 4, 9], [0, 2, 3, 7]), [Infinity, 3, 4 / 3, 9 / 7]);
    });

    it("Divide vector4 should be correct", () => {
      assert4(divide4([5, 6, 3, 1], [-2, -0, 7, 3]), [-2.5, -Infinity, 3 / 7, 1 / 3]);
    });
  });

  describe("Dot", () => {
    it("Dot vector1 should be correct", () => {
      assert1([dot1([2], [3])], [6]);
    });

    it("Dot vector1 should be correct", () => {
      assert1([dot1([2, 6], [3])], [6]);
    });

    it("Dot vector1 should be correct", () => {
      assert1([dot1([2], [3, 7])], [6]);
    });

    it("Dot vector2 should be correct", () => {
      assert1([dot2([2, 3], [4, 5])], [23]);
    });

    it("Dot vector2 should be correct", () => {
      assert1([dot2([2, -3], [8, 5, 7])], [1]);
    });

    it("Dot vector2 should be correct", () => {
      assert1([dot2([0, -3, 9], [8, 0, 7])], [0]);
    });

    it("Dot vector3 should be correct", () => {
      assert1([dot3([0, -3, 9], [8, 0, 7])], [63]);
    });

    it("Dot vector3 should be correct", () => {
      assert1([dot3([1, 2, 3, 4], [4, 5, 6])], [32]);
    });

    it("Dot vector3 should be correct", () => {
      assert1([dot3([1, 2, 3, 4], [4, 5, 6, 7])], [32]);
    });

    it("Dot vector4 should be correct", () => {
      assert1([dot4([1, 2, 3, 4], [4, 5, 6, 7])], [60]);
    });

    it("Dot vector4 should be correct", () => {
      assert1([dot4([-1, 2, -3, 4], [4, 5, 6, 7])], [16]);
    });
  });

  describe("Flatten", () => {
    it("Flattern vector1 should be correct", () => {
      const v1: Vec1Compat = [1];
      const v2: Vec1Compat = [2];
      const v3: Vec1Compat = [3];
      const v4: Vec1Compat = [4];
      const list = [v1, v2, v3, v4];
      assertArray(flatten1(list), [1, 2, 3, 4]);
    });

    it("Flattern vector2 should be correct", () => {
      const v1: Vec2Compat = [1, 2];
      const v2: Vec2Compat = [3, 4];
      const v3: Vec2Compat = [5, 6];
      const v4: Vec2Compat = [7, 8];
      const v5: Vec2Compat = [9, 10];
      const list = [v1, v2, v3, v4, v5];
      assertArray(flatten2(list), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("Flattern vector3 should be correct", () => {
      const v1: Vec3Compat = [1, 2, 6];
      const v2: Vec3Compat = [3, 4, 2];
      const v3: Vec3Compat = [5, 6, 9];
      const v4: Vec3Compat = [7, 8, 1];
      const v5: Vec3Compat = [9, 10, 14];
      const list = [v1, v2, v3, v4, v5];
      assertArray(flatten3(list), [1, 2, 6, 3, 4, 2, 5, 6, 9, 7, 8, 1, 9, 10, 14]);
    });

    it("Flattern vector4 should be correct", () => {
      const v1: Vec4Compat = [1, 2, 6, 7];
      const v2: Vec4Compat = [3, 4, 2, 12];
      const v3: Vec4Compat = [5, 6, 9, 11];
      const v4: Vec4Compat = [7, 8, 1, 15];
      const v5: Vec4Compat = [9, 10, 14, 17];
      const list = [v1, v2, v3, v4, v5];
      assertArray(flatten4(list), [1, 2, 6, 7, 3, 4, 2, 12, 5, 6, 9, 11, 7, 8, 1, 15, 9, 10, 14, 17]);
    });
  });

  describe("Floor", () => {
    [
      [0],
      [0.6],
      [0.7, 1.2],
      [0.01],
      [1e-11]
    ].forEach((t: Vec1Compat) => {
      it("Floor Vector1 should be true", () => {
        assert1(floor1(t), [0]);
      });
    });

    it("Floor Vector1 should be false", () => {
      assert1(floor1([1]), [0], false);
    });

    [
      [1, 2],
      [1.6, 2.7],
      [1.7, 2.2, 3],
      [1.01, 2.0001],
      [1 + 1e-11, 2 + 1e-13]
    ].forEach((t: Vec2Compat) => {
      it("Floor Vector2 should be true", () => {
        assert2(floor2(t), [1, 2]);
      });
    });

    [
      [2, 2],
      [2, 3],
      [1, 3]
    ].forEach((t: Vec2Compat) => {
      it("Floor Vector2 should be false", () => {
        assert2(floor2(t), [1, 2], false);
      });
    });

    [
      [1, 2, 3],
      [1.6, 2.7, 3.3],
      [1.7, 2.2, 3],
      [1.01, 2, 3.0001],
      [1.009, 2 + 1e-11, 3 + 1e-13]
    ].forEach((t: Vec3Compat) => {
      it("Floor Vector3 should be true", () => {
        assert3(floor3(t), [1, 2, 3]);
      });
    });

    [
      [3, 4, 5],
      [3, 2, 3],
      [2, 2.2, 4],
      [2, 3, 3.3]
    ].forEach((t: Vec3Compat) => {
      it("Floor Vector3 should be false", () => {
        assert3(floor3(t), [2, 3, 4], false);
      });
    });

    [
      [1, 2, 3, 4],
      [1.6, 2.7, 3.3, 4.5],
      [1.7, 2.2, 3, 4],
      [1, 2, 3.0001, 4.1],
      [1.009, 2 + 1e-11, 3 + 1e-13, 5 - 1e-14]
    ].forEach((t: Vec4Compat) => {
      it("Floor Vector4 should be true", () => {
        assert4(floor4(t), [1, 2, 3, 4]);
      });
    });

    [
      [3, 4, 5, 6],
      [1.1, 2, 5, 6],
      [1, 2.2, 3, 4],
      [3, 4, 3.3, 4],
      [2, 3, 5, 4.5]
    ].forEach((t: Vec4Compat) => {
      it("Floor Vector4 should be false", () => {
        assert4(floor4(t), [2, 3, 4, 5], false);
      });
    });
  });

  describe("Inverse", () => {
    it("Inverse Vector1 should be true", () => {
      assert1(inverse1([1]), [1], true);
    });

    it("Inverse Vector1 should be true", () => {
      assert1(inverse1([3]), [1 / 3], true);
    });

    it("Inverse Vector1 should be true", () => {
      assert1(inverse1([-2]), [-0.5], true);
    });

    it("Inverse Vector1 should be true", () => {
      assert1(inverse1([0]), [Infinity], true);
    });

    it("Inverse Vector1 should be true", () => {
      assert1(inverse1([-0]), [-Infinity], true);
    });

    it("Inverse Vector2 should be true", () => {
      assert2(inverse2([1, 0.5]), [1, 2], true);
    });

    it("Inverse Vector2 should be true", () => {
      assert2(inverse2([7, -9]), [1 / 7, -1 / 9], true);
    });

    it("Inverse Vector2 should be true", () => {
      assert2(inverse2([0, -0]), [Infinity, -Infinity], true);
    });

    it("Inverse Vector3 should be true", () => {
      assert3(inverse3([1, 4, -0.5]), [1, 0.25, -2], true);
    });

    it("Inverse Vector3 should be true", () => {
      assert3(inverse3([11, -13, -17]), [1 / 11, -1 / 13, -1 / 17], true);
    });

    it("Inverse Vector3 should be true", () => {
      assert3(inverse3([0, -0, 0]), [Infinity, -Infinity, Infinity], true);
    });

    it("Inverse Vector4 should be true", () => {
      assert4(inverse4([1, 4, -0.5, 0.2]), [1, 0.25, -2, 5], true);
    });

    it("Inverse Vector4 should be true", () => {
      assert4(inverse4([3, 7, -19, 21]), [1 / 3, 1 / 7, -1 / 19, 1 / 21], true);
    });

    it("Inverse Vector4 should be true", () => {
      assert4(inverse4([0, 0, -0, -0]), [Infinity, Infinity, -Infinity, -Infinity], true);
    });
  });

  describe("Linear", () => {
    it("Linear Vector1 should be true", () => {
      assert1(linear1([1], [2], 0), [1]);
    });

    it("Linear Vector1 should be true", () => {
      assert1(linear1([1], [2], 1), [2]);
    });

    it("Linear Vector1 should be true", () => {
      assert1(linear1([1], [2], 0.5), [1.5]);
    });

    it("Linear Vector2 should be true", () => {
      assert2(linear2([1, 3], [2, 6], 0), [1, 3]);
    });

    it("Linear Vector2 should be true", () => {
      assert2(linear2([1, 3], [2, 6], 1), [2, 6]);
    });

    it("Linear Vector2 should be true", () => {
      assert2(linear2([1, 3], [2, 6], 0.33), [1.33, 3.99]);
    });

    it("Linear Vector3 should be true", () => {
      assert3(linear3([1, 3, 5], [2, 6, 2], 0), [1, 3, 5]);
    });

    it("Linear Vector3 should be true", () => {
      assert3(linear3([1, 3, 5], [2, 6, 2], 1), [2, 6, 2]);
    });

    it("Linear Vector3 should be true", () => {
      assert3(linear3([1, 3, 5], [2, 6, 2], 0.3), [1.3, 3.9, 4.1]);
    });

    it("Linear Vector4 should be true", () => {
      assert4(linear4([1, 3, 5, 6], [2, 6, 2, 6], 0), [1, 3, 5, 6]);
    });

    it("Linear Vector4 should be true", () => {
      assert4(linear4([1, 3, 5, 6], [2, 6, 2, 6], 1), [2, 6, 2, 6]);
    });

    it("Linear Vector4 should be true", () => {
      assert4(linear4([1, 3, 5, 6], [2, 6, 8, 6], 0.7), [1.7, 5.1, 7.1, 6]);
    });
  });

  describe("Max", () => {
    it("Max Vector1 should be true", () => {
      assert1(max1([1], [2]), [2], true);
    });

    it("Max Vector1 should be true", () => {
      assert1(max1([2], [2]), [2], true);
    });

    it("Max Vector1 should be true", () => {
      assert1(max1([-Infinity], [2]), [2], true);
    });

    it("Max Vector1 should be true", () => {
      assert1(max1([Infinity], [2]), [Infinity], true);
    });

    it("Max Vector1 should be true", () => {
      assert1(max1([Infinity], [Infinity]), [Infinity], true);
    });

    it("Max Vector1 should be true", () => {
      assert1(max1([-Infinity], [-Infinity]), [-Infinity], true);
    });

    it("Max Vector1 should be true", () => {
      assert1(max1([Number.MIN_VALUE], [Number.MAX_VALUE]), [Number.MAX_VALUE], true);
    });

    it("Max Vector2 should be true", () => {
      assert2(max2([1, 2], [2, 2]), [2, 2], true);
    });

    it("Max Vector2 should be true", () => {
      assert2(max2([-Infinity, Infinity], [2, 2]), [2, Infinity], true);
    });

    it("Max Vector2 should be true", () => {
      assert2(
        max2(
          [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER],
          [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
        ),
        [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
        true
      );
    });

    it("Max Vector3 should be true", () => {
      assert3(max3([1, 2, 3], [2, 2, 3.3]), [2, 2, 3.3], true);
    });

    it("Max Vector3 should be true", () => {
      assert3(max3([-Infinity, Infinity, -2], [2, 2, 0]), [2, Infinity, 0], true);
    });

    it("Max Vector3 should be true", () => {
      assert3(
        max3(
          [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
          [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
        ),
        [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
        true
      );
    });

    it("Max Vector4 should be true", () => {
      assert4(max4([1, 2, 3, 4.1], [2, 2, 3.3, -2]), [2, 2, 3.3, 4.1], true);
    });

    it("Max Vector4 should be true", () => {
      assert4(max4([-Infinity, Infinity, -2, 1200], [2, 2, 0, Infinity]), [2, Infinity, 0, Infinity], true);
    });

    it("Max Vector4 should be true", () => {
      assert4(
        max4(
          [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
          [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
        ),
        [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
        true
      );
    });
  });

  describe("Min", () => {
    it("Min Vector1 should be true", () => {
      assert1(min1([1], [2]), [1], true);
    });

    it("Min Vector1 should be true", () => {
      assert1(min1([2], [2]), [2], true);
    });

    it("Min Vector1 should be true", () => {
      assert1(min1([-Infinity], [2]), [-Infinity], true);
    });

    it("Min Vector1 should be true", () => {
      assert1(min1([-Infinity], [-Infinity]), [-Infinity], true);
    });

    it("Min Vector1 should be true", () => {
      assert1(min1([Infinity], [Infinity]), [Infinity], true);
    });

    it("Min Vector1 should be true", () => {
      assert1(min1([Infinity], [2]), [2], true);
    });

    it("Min Vector1 should be true", () => {
      assert1(min1([Number.MIN_VALUE], [Number.MAX_VALUE]), [Number.MIN_VALUE], true);
    });

    it("Min Vector2 should be true", () => {
      assert2(min2([1, 2], [2, 2]), [1, 2], true);
    });

    it("Min Vector2 should be true", () => {
      assert2(min2([-Infinity, Infinity], [2, 2]), [-Infinity, 2], true);
    });

    it("Min Vector2 should be true", () => {
      assert2(
        min2(
          [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER],
          [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
        ),
        [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER],
        true
      );
    });

    it("Min Vector3 should be true", () => {
      assert3(min3([1, 2, 3], [2, 2, 3.3]), [1, 2, 3], true);
    });

    it("Min Vector3 should be true", () => {
      assert3(min3([-Infinity, Infinity, -2], [2, 2, 0]), [-Infinity, 2, -2], true);
    });

    it("Min Vector3 should be true", () => {
      assert3(
        min3(
          [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
          [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
        ),
        [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
        true
      );
    });

    it("Min Vector4 should be true", () => {
      assert4(min4([1, 2, 3, 4.1], [2, 2, 3.3, -2]), [1, 2, 3, -2], true);
    });

    it("Min Vector4 should be true", () => {
      assert4(min4([-Infinity, Infinity, -2, 1200], [2, 2, 0, Infinity]), [-Infinity, 2, -2, 1200], true);
    });

    it("Min Vector4 should be true", () => {
      assert4(
        min4(
          [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
          [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
        ),
        [Number.MIN_VALUE, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
        true
      );
    });
  });

  describe("Multiply", () => {
    it("Multiply vector1 should be true", () => {
      assert1(multiply1([1], [2]), [2], true);
    });

    it("Multiply vector1 should be true", () => {
      assert1(multiply1([1], [0]), [0], true);
    });

    it("Multiply vector1 should be true", () => {
      assert1(multiply1([3], [-Infinity]), [-Infinity], true);
    });

    it("Multiply vector1 should be true", () => {
      assert1(multiply1([Infinity], [100]), [Infinity], true);
    });

    it("Multiply vector2 should be true", () => {
      assert2(multiply2([1, 2], [2, 4]), [2, 8], true);
    });

    it("Multiply vector2 should be true", () => {
      assert2(multiply2([0, 2], [2, 0]), [0, 0], true);
    });

    it("Multiply vector2 should be true", () => {
      assert2(multiply2([Infinity, 2], [2, -Infinity]), [Infinity, -Infinity], true);
    });

    it("Multiply vector3 should be true", () => {
      assert3(multiply3([1, 2, 3], [2, 4, 7]), [2, 8, 21], true);
    });

    it("Multiply vector3 should be true", () => {
      assert3(multiply3([1, -2, 0], [2, 1.1, 10]), [2, -2.2, 0], true);
    });

    it("Multiply vector3 should be true", () => {
      assert3(multiply3([Infinity, 2, -4], [-1, Infinity, -Infinity]), [-Infinity, Infinity, Infinity], true);
    });

    it("Multiply vector4 should be true", () => {
      assert4(multiply4([1, 2, 3, 4], [2, 4, 7, 8]), [2, 8, 21, 32], true);
    });

    it("Multiply vector4 should be true", () => {
      assert4(multiply4([1, 3.3, 0, 4], [2, 4, 7, -2.1]), [2, 13.2, 0, -8.4], true);
    });

    it("Multiply vector4 should be true", () => {
      assert4(multiply4([Infinity, 2, -4, 0], [-1, Infinity, -Infinity, 0]), [-Infinity, Infinity, Infinity, 0], true);
    });
  });

  describe("Normalize", () => {
    it("Normalize vector1 should be true", () => {
      assert1(normalize1([3]), [1]);
    });

    it("Normalize vector2 should be true", () => {
      assert2(normalize2([30, 30]), [1 / Math.sqrt(2), 1 / Math.sqrt(2)]);
    });

    it("Normalize vector2 should be true", () => {
      assert2(normalize2([3, 4]), [0.6, 0.8]);
    });

    it("Normalize vector2 should be true", () => {
      assert2(normalize2([6, 8]), [0.6, 0.8]);
    });

    it("Normalize vector2 should be true", () => {
      assert2(normalize2([5, 12]), [5 / 13, 12 / 13]);
    });

    it("Normalize vector3 should be true", () => {
      fuzzyAssert3(normalize3([5, 5, 5]), [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)]);
    });

    it("Normalize vector3 should be true", () => {
      fuzzyAssert3(normalize3([3, 4, 5]), [3 / Math.sqrt(50), 4 / Math.sqrt(50), 5 / Math.sqrt(50)]);
    });

    it("Normalize vector3 should be true", () => {
      fuzzyAssert3(normalize3([-2, 4, -4]), [-1 / 3, 2 / 3, -2 / 3]);
    });

    it("Normalize vector4 should be true", () => {
      fuzzyAssert4(normalize4([6, 6, 6, 6]), [0.5, 0.5, 0.5, 0.5]);
    });

    it("Normalize vector4 should be true", () => {
      fuzzyAssert4(normalize4([1, -2, 3, -4]), [1 / Math.sqrt(30), -2 / Math.sqrt(30), 3 / Math.sqrt(30), -4 / Math.sqrt(30)]);
    });
  });

  describe("Scale", () => {
    it("Scale vector1 should be true", () => {
      assert1(scale1([3], 2), [6]);
    });

    it("Scale vector1 should be true", () => {
      assert1(scale1([3], 0), [0]);
    });

    it("Scale vector2 should be true", () => {
      assert2(scale2([3, 2], 2), [6, 4]);
    });

    it("Scale vector2 should be true", () => {
      assert2(scale2([3, 2], 0), [0, 0]);
    });

    it("Scale vector2 should be true", () => {
      fuzzyAssert2(scale2([3, 2], 2.4), [7.2, 4.8]);
    });

    it("Scale vector3 should be true", () => {
      assert3(scale3([3, 2, 7], 2), [6, 4, 14]);
    });

    it("Scale vector3 should be true", () => {
      assert3(scale3([3, 2, 7], 0), [0, 0, 0]);
    });

    it("Scale vector3 should be true", () => {
      fuzzyAssert3(scale3([3, 2, 7], 0.33), [0.99, 0.66, 2.31]);
    });

    it("Scale vector4 should be true", () => {
      assert4(scale4([3, 2, 7, 5], 2), [6, 4, 14, 10]);
    });

    it("Scale vector4 should be true", () => {
      assert4(scale4([3, 2, 7, 5], 0), [0, 0, 0, 0]);
    });

    it("Scale vector4 should be true", () => {
      fuzzCompare4(scale4([3, 2, 7, 5], 0.27), [0.81, 0.54, 1.89, 1.35]);
    });

    it("Scale vector4 should be true", () => {
      fuzzCompare4(scale4([Infinity, -Infinity, 0, 5], -0.27), [-Infinity, Infinity, 0, -1.35]);
    });
  });
});
