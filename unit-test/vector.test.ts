import assert from 'assert';
import { describe, it } from 'mocha';
import { add1, add2, add3, add4, ceil1, ceil2, ceil3, ceil4, compare1, compare2, compare3, compare4, copy1, copy2, copy3, copy4, cross1, cross2, cross3, cross4, divide1, divide2, divide3, divide4, dot1, dot2, dot3, dot4, flatten1, toString1, toString2, toString3, toString4, Vec1, Vec1Compat, Vec2, Vec2Compat, Vec3, Vec3Compat, Vec4, Vec4Compat } from '../src/util/vector';

function fail1(actual: Vec1, expected: Vec1): string {
  return `\n\nACTUAL: ${toString1(actual)}\nEXPECTED: ${toString1(expected)}`;
}

function fail2(actual: Vec2, expected: Vec2): string {
  return `\n\nACTUAL: ${toString2(actual)}\nEXPECTED: ${toString2(expected)}`;
}

function fail3(actual: Vec3, expected: Vec3): string {
  return `\n\nACTUAL: ${toString3(actual)}\nEXPECTED: ${toString3(expected)}`;
}

function fail4(actual: Vec4, expected: Vec4): string {
  return `\n\nACTUAL: ${toString4(actual)}\nEXPECTED: ${toString4(expected)}`;
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

function compareArray(actual: number[], expected: number[]) {
  const length = Math.min(actual.length, expected.length);

  for (let i = 0; i < length; i++) {
    if (actual[i] !== expected[i]) return false;
  }

  return true;
}

function assertArray(actual: number[], expected: number[], shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal();
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

  describe(`Divide`, () => {
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
    it("Flattern vector4 should be correct", () => {
      const v1: Vec1Compat = [1];
      const v2: Vec1Compat = [2];
      const v3: Vec1Compat = [3];
      const v4: Vec1Compat = [4];
      const list = [v1, v2, v3, v4];
    });
  });

  describe("Floor", () => {
    //
  });

  describe("Inverse", () => {
    //
  });

  describe("Linear", () => {
    //
  });

  describe("Max", () => {
    //
  });

  describe("Min", () => {
    //
  });

  describe("Multiply", () => {
    //
  });

});
