import assert from 'assert';
import { describe, it } from 'mocha';
import { compare4x4, Mat4x4, toString4x4 } from '../src/math/matrix';
import { addQuat, divideQuat, imaginaryQuat, iQuat, jQuat, kQuat, lookAtMatrix, lookAtQuat, matrix4x4FromUnitQuat, multiplyQuat, oneQuat, Quaternion, realQuat, zeroQuat } from '../src/math/quaternion';
import { compare1, compare3, compare4, fuzzyCompare4, Vec1, Vec3 } from '../src/math/vector';
import { fail1, fail3, fail4, fuzzCompare4 } from './vector.test';

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
        lookAtQuat([0, 0, 1], [0, 1, 0]),
        [1, 0, 0, 0]
      );
    });
  });
});
