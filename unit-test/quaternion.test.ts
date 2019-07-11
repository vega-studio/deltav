import assert from 'assert';
import { describe, it } from 'mocha';
import { compare4x4, Mat4x4, toString4x4, transform4 } from '../src/math/matrix';
import { addQuat, conjugateQuat, divideQuat, dotQuat, exponentQuat, imaginaryQuat, inverseQuat, iQuat, jQuat, kQuat, lengthQuat, lookAtMatrix, lookAtQuat, matrix4x4FromUnitQuat, multiplyQuat, normalizeQuat, oneQuat, Quaternion, realQuat, scaleQuat, zeroQuat } from '../src/math/quaternion';
import { compare1, compare3, compare4, fuzzyCompare4, Vec1, Vec3, Vec4 } from '../src/math/vector';
import { fail1, fail3, fail4, fuzzCompare4 } from './vector.test';

const { exp, cos, sin, sqrt } = Math;

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(expected)}`;
}

function assert1(actual: Vec1, expected: Vec1, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare1(actual, expected), true, fail1(actual, expected));
  }

  else {
    assert.equal(!compare1(actual, expected), true, fail1(actual, expected));
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

function assert4(actual: Quaternion, expected: Quaternion, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare4(actual, expected), true, fail4(actual, expected));
  }

  else {
    assert.equal(!compare4(actual, expected), true, fail4(actual, expected));
  }
}

function fuzzyAssertNumber(actual: number, expected: number, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(actual - expected <= 1e07, true, fail1([actual], [expected]));
  }

  else {
    assert.equal(actual - expected > 1e07, true, fail1([actual], [expected]));
  }
}

function fuzzyAssert4(actual: Quaternion, expected: Quaternion, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzCompare4(actual, expected), true, fail4(actual, expected));
  }

  else {
    assert.equal(!fuzzCompare4(actual, expected), true, fail4(actual, expected));
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

describe("Quaternion", () => {
  describe("ZeroQuat", () => {
    it("ZeroQuat should be correct", () => {
      assert4(zeroQuat(), [0, 0, 0, 0]);
    });
  });

  describe("OneQuat", () => {
    it("OneQuat should be correct", () => {
      assert4(oneQuat(), [1, 0, 0, 0]);
    });
  });

  describe("iQuat", () => {
    it("iQuat should be correct", () => {
      assert4(iQuat(), [0, 1, 0, 0]);
    });
  });

  describe("jQuat", () => {
    it("jQuat should be correct", () => {
      assert4(jQuat(), [0, 0, 1, 0]);
    });
  });

  describe("kQuat", () => {
    it("kQuat should be correct", () => {
      assert4(kQuat(), [0, 0, 0, 1]);
    });
  });

  describe("RealQuat", () => {
    it("RealQuat should be correct", () => {
      assert1([realQuat([2, 3, 4, 5])], [2]);
    });
  });

  describe("ImaginaryQuat", () => {
    it("ImaginaryQuat should be correct", () => {
      assert3(imaginaryQuat([2, 3, 4, 5]), [3, 4, 5]);
    });
  });

  describe("Add Quaternion", () => {
    it("Add Quaternion should be correct", () => {
      assert4(addQuat([1, 2, 3, 4], [5, 6, 7, 8]), [6, 8, 10, 12]);
    });
  });

  describe("Multiply Quaternion", () => {
    it("Multiply Quaternion should be correct", () => {
      assert4(multiplyQuat([1, 2, 3, 4], [6, 2, 3, 1]), [-11, 5, 27, 25]);
    });

    it("Multiply Quaternion should be correct", () => {
      assert4(multiplyQuat([1, 2, 3, 4], [0, 0, 0, 0]), [0, 0, 0, 0]);
    });

    it("Multiply Quaternion should be correct", () => {
      assert4(multiplyQuat([1, 2, 3, 4], [2, 0, 0, 0]), [2, 4, 6, 8]);
    });

    it("Multiply Quaternion should be correct", () => {
      assert4(multiplyQuat([1, 2, 3, 4], [0, 3, 0, 0]), [-6, 3, 12, -9]);
    });

    it("Multiply Quaternion should be correct", () => {
      assert4(multiplyQuat([1, 2, 3, 4], [0, 0, 2, 0]), [-6, -8, 2, 4]);
    });

    it("Multiply Quaternion should be correct", () => {
      assert4(multiplyQuat([1, 2, 3, 4], [0, 0, 0, 4]), [-16, 12, -8, 4]);
    });
  });

  describe("Divide Quaternion", () => {
    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([1, 2, 3, 4], [0, 0, 0, 0]), [0, 0, 0, 0]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([1, 2, 3, 4], [2, 5, 1, 7]), [43 / 79, -18 / 79, -1 / 79, 14 / 79]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([4, 6, 8, 10], [2, 0, 0, 0]), [2, 3, 4, 5]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([4, 6, 8, 10], [0, 2, 0, 0]), [3, -2, -5, 4]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([1, 2, 3, 7], [0, 0, 3, 0]), [1, 7 / 3, - 1 / 3,  - 2 / 3]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([3, 1, 5, 7], [0, 0, 0, 5]), [7 / 5, -1, 1 / 5, -3 / 5]);
    });
  });

  describe("Lookat Quaternion", () => {
    it("LookAt Quaternion should be correct", () => {
      assert4x4(
        matrix4x4FromUnitQuat(lookAtQuat([1, 1, 1], [0, 1, 0])),
        lookAtMatrix([1, 1, 1], [0, 1, 0])
      );
    });

    it("LookAt Quaternion should be correct", () => {
      assert4x4(
        matrix4x4FromUnitQuat(lookAtQuat([1, 1, 1], [2, 1, 3])),
        lookAtMatrix([1, 1, 1], [2, 1, 3])
      );
    });

    it("LookAt Quaternion should be correct", () => {
      assert4x4(
        matrix4x4FromUnitQuat(lookAtQuat([1, 2, 3], [2, 1, 3])),
        lookAtMatrix([1, 2, 3], [2, 1, 3])
      );
    });

    it("LookAt Quaternion should be correct with negative values", () => {
      assert4x4(
        matrix4x4FromUnitQuat(lookAtQuat([-1, -2, -3], [0, 1, 0])),
        lookAtMatrix([-1, -2, -3], [0, 1, 0])
      );
    });

    it("LookAt Quaternion should be identity", () => {
      assert4(
        lookAtQuat([0, 0, -1], [0, 1, 0]),
        [1, 0, 0, 0]
      );
    });

    it("LookAt Quaternion should be correct", () => {
      const v: Vec4 = [-1, -1, -1, 1];
      const look = lookAtQuat([-1, -1, -1], [0, 1, 0]);
      fuzzyAssert4(
        transform4(
          matrix4x4FromUnitQuat(look),
          v
        ),
        [0, 0, -sqrt(3), 1]
      );
    });

    it("LookAt Quaternion should be correct", () => {
      const v: Vec4 = [-2, -3, -4, 1];
      const look = lookAtQuat([2, 3, 4], [0, 1, 0]);
      fuzzyAssert4(
        transform4(
          matrix4x4FromUnitQuat(look),
          v
        ),
        [0, 0, sqrt(29), 1]
      );
    });

  });

  describe("Exponent Quaternion", () => {
    it("exponentiation of a quaternion should be corrent", () => {
      assert4(exponentQuat([3, 0, 0, 0]), [exp(3), 0, 0, 0]);
    });

    it("exponentiation of a quaternion should be corrent", () => {
      fuzzyAssert4(
        exponentQuat([5, 4, 4, 2]),
        [
          exp(5) * cos(6),
          4 * exp(5) * sin(6) / 6,
          4 * exp(5) * sin(6) / 6,
          2 * exp(5) * sin(6) / 6
        ]);
    });

    it("exponentiation of a quaternion should be corrent", () => {
      const coff = sqrt(109);
      fuzzyAssert4(
        exponentQuat([7, 3, 6, 8]),
        [
          exp(7) * cos(coff),
          3 * exp(7) * sin(coff) / coff,
          6 * exp(7) * sin(coff) / coff,
          8 * exp(7) * sin(coff) / coff
        ]);
    });
  });

  describe("Scale Quaternion", () => {
    it("Scale of a quaternion should be correct", () => {
      fuzzyAssert4(scaleQuat([1, 3, 7, -3], 0.3), [0.3, 0.9, 2.1, -0.9]);
    });

    it("Scale of a quaternion should be correct", () => {
      fuzzyAssert4(scaleQuat([1, 3, 7, -3], 0), [0, 0, 0.0, -0.0]);
    });

    it("Scale of a quaternion should be correct", () => {
      fuzzyAssert4(scaleQuat([0, 0, 0, 0], 20), [0, 0, 0.0, 0.0]);
    });
  });

  describe("Conjugate Quaternion", () => {
    it("Conjugate of a quaternion should be correct", () => {
      fuzzyAssert4(conjugateQuat([2, 3, 4, 5]), [2, -3, -4, -5]);
    });

    it("Conjugate of a quaternion should be correct", () => {
      fuzzyAssert4(conjugateQuat([2, 0, 0, 0]), [2, -0, -0, -0]);
    });

    it("Conjugate of a quaternion should be correct", () => {
      fuzzyAssert4(conjugateQuat([0, 3, 4, 5]), [0, -3, -4, -5]);
    });
  });

  describe("Inverse Quaternion", () => {
    it("Inverse of a quaternion should be correct", () => {
      fuzzyAssert4(inverseQuat([0, 0, 0, 0]), [0, 0, 0, 0]);
    });

    it("Inverse of a quaternion should be correct", () => {
      fuzzyAssert4(inverseQuat([4, 0, 0, 0]), [0.25, 0, 0, 0]);
    });

    it("Inverse of a quaternion should be correct", () => {
      fuzzyAssert4(inverseQuat([0, 4, 3, -2]), [0, -4 / 29, -3 / 29, 2 / 29]);
    });

    it("Inverse of a quaternion should be correct", () => {
      fuzzyAssert4(inverseQuat([1, -2, 3, -4]), [1 / 30, 2 / 30, -3 / 30, 4 / 30]);
    });
  });

  describe("Length Quaternion", () => {
    it("Length of a quaternion should be correct", () => {
      fuzzyAssertNumber(lengthQuat([1, 2, 3, 4]), sqrt(30));
    });

    it("Length of a quaternion should be correct", () => {
      fuzzyAssertNumber(lengthQuat([0, 0, 0, 0]), 0);
    });

    it("Length of a quaternion should be correct", () => {
      fuzzyAssertNumber(lengthQuat([13, 0, 0, 0]), 13);
    });

    it("Length of a quaternion should be correct", () => {
      fuzzyAssertNumber(lengthQuat([0, 2, -4, 4]), 6);
    });
  });

  describe("Normalize Quaternion", () => {
    it("Normalize of a quaternion should be correct", () => {
      fuzzyAssert4(normalizeQuat([1, 2, 3, 4]), [1 / sqrt(30), 2 / sqrt(30), 3 / sqrt(30), 4 / sqrt(30)]);
    });

    it("Normalize of a quaternion should be correct", () => {
      fuzzyAssert4(normalizeQuat([100, 0, 0, 0]), [1, 0, 0, 0]);
    });

    it("Normalize of a quaternion should be correct", () => {
      fuzzyAssert4(normalizeQuat([0, 6, 5, 2]), [0, 6 / sqrt(65), 5 / sqrt(65), 2 / sqrt(65)]);
    });

    it("Normalize of a quaternion should be correct", () => {
      fuzzyAssert4(normalizeQuat([0, 0, 0, 0]), [0, 0, 0, 0]);
    });
  });

  describe("Dot Quaternion", () => {
    it("Dot Quaternion should be correct", () => {
      fuzzyAssertNumber(dotQuat([0, 2, 0, 4], [4, 0, 6, 0]), 0);
    });

    it("Dot Quaternion should be correct", () => {
      fuzzyAssertNumber(dotQuat([1, 2, 3, 4], [4, 5, 6, 7]), 60);
    });

    it("Dot Quaternion should be correct", () => {
      fuzzyAssertNumber(dotQuat([-1, 2, -3, 4], [4, 5, 6, 7]), 16);
    });
  });
});
