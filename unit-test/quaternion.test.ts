import assert from "assert";
import { describe, it } from "@jest/globals";

import {
  addQuat,
  angleQuat,
  axisQuat,
  conjugateQuat,
  divideQuat,
  dotQuat,
  eulerToQuat,
  exponentQuat,
  fromEulerAxisAngleToQuat,
  imaginaryQuat,
  inverseQuat,
  iQuat,
  jQuat,
  kQuat,
  lengthQuat,
  lookAtMatrix,
  lookAtQuat,
  matrix4x4FromUnitQuatView,
  matrix4x4ToQuaternion,
  multiplyQuat,
  normalizeQuat,
  oneQuat,
  Quaternion,
  realQuat,
  rotateVectorByUnitQuat,
  scaleQuat,
  slerpUnitQuat,
  toEulerFromQuat,
  toEulerXYZfromOrderedEuler,
  zeroQuat,
} from "../ui/src/math/quaternion";
import {
  compare1,
  compare3,
  compare4,
  forward3,
  Vec1,
  Vec3,
  Vec4,
} from "../ui/src/math/vector";
import {
  compare4x4,
  Mat4x4,
  rotation4x4,
  toString4x4,
  transform4,
} from "../ui/src/math/matrix";
import { EulerOrder } from "../ui/src/types";
import { fail1, fail3, fail4, fuzzCompare4 } from "./vector.test";

const { exp, cos, sin, sqrt } = Math;

const TO_RADIANS = Math.PI / 180;

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(
    expected
  )}`;
}

function fuzzyCompare3(v1: Vec3, v2: Vec3): boolean {
  return (
    Math.abs(v1[0] - v2[0]) <= 1e-4 &&
    Math.abs(v1[1] - v2[1]) <= 1e-4 &&
    Math.abs(v1[2] - v2[2]) <= 1e-4
  );
}

function assert1(actual: Vec1, expected: Vec1, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(compare1(actual, expected), true, fail1(actual, expected));
  } else {
    assert.equal(!compare1(actual, expected), true, fail1(actual, expected));
  }
}

function assert3(actual: Vec3, expected: Vec3, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(compare3(actual, expected), true, fail3(actual, expected));
  } else {
    assert.equal(!compare3(actual, expected), true, fail3(actual, expected));
  }
}

function assert4(actual: Quaternion, expected: Quaternion, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(compare4(actual, expected), true, fail4(actual, expected));
  } else {
    assert.equal(!compare4(actual, expected), true, fail4(actual, expected));
  }
}

function fuzzyAssertNumber(
  actual: number,
  expected: number,
  shouldEqual = true
) {
  if (shouldEqual) {
    assert.equal(actual - expected <= 1e7, true, fail1([actual], [expected]));
  } else {
    assert.equal(actual - expected > 1e7, true, fail1([actual], [expected]));
  }
}

function fuzzyAssert3(actual: Vec3, expected: Vec3, shouldEqual = true) {
  if (shouldEqual) {
    assert.equal(
      fuzzyCompare3(actual, expected),
      true,
      fail3(actual, expected)
    );
  } else {
    assert.equal(
      !fuzzyCompare3(actual, expected),
      true,
      fail3(actual, expected)
    );
  }
}

function fuzzyAssert4(
  actual: Quaternion,
  expected: Quaternion,
  shouldEqual = true
) {
  if (shouldEqual) {
    assert.equal(fuzzCompare4(actual, expected), true, fail4(actual, expected));
  } else {
    assert.equal(
      !fuzzCompare4(actual, expected),
      true,
      fail4(actual, expected)
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
      fuzzyAssert4(divideQuat([1, 2, 3, 4], [2, 5, 1, 7]), [
        43 / 79,
        -18 / 79,
        -1 / 79,
        14 / 79,
      ]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([4, 6, 8, 10], [2, 0, 0, 0]), [2, 3, 4, 5]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([4, 6, 8, 10], [0, 2, 0, 0]), [3, -2, -5, 4]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([1, 2, 3, 7], [0, 0, 3, 0]), [
        1,
        7 / 3,
        -1 / 3,
        -2 / 3,
      ]);
    });

    it("Divide Quaternion should be correct", () => {
      fuzzyAssert4(divideQuat([3, 1, 5, 7], [0, 0, 0, 5]), [
        7 / 5,
        -1,
        1 / 5,
        -3 / 5,
      ]);
    });
  });

  describe("Lookat Quaternion", () => {
    it("LookAt Quaternion should be correct", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([1, 1, 1], [0, 1, 0])),
        lookAtMatrix([1, 1, 1], [0, 1, 0])
      );
    });

    it("LookAt Quaternion should be correct", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([1, 1, 1], [2, 1, 3])),
        lookAtMatrix([1, 1, 1], [2, 1, 3])
      );
    });

    it("LookAt Quaternion should be correct", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([1, 2, 3], [2, 1, 3])),
        lookAtMatrix([1, 2, 3], [2, 1, 3])
      );
    });

    it("LookAt Quaternion should be correct with negative values", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([-1, -2, -3], [0, 1, 0])),
        lookAtMatrix([-1, -2, -3], [0, 1, 0])
      );
    });

    it("LookAt [0, 0, -1] Quaternion should be identity", () => {
      assert4(lookAtQuat([0, 0, -1], [0, 1, 0]), [1, 0, 0, 0]);
    });

    it("LookAt [0, 0, 1] Matrix should be same as rotate y axis by 180 degree", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([0, 0, 1], [0, 1, 0])),
        rotation4x4(0, 180 * TO_RADIANS, 0)
      );
    });

    it("LookAt [1, 0, 0] Matrix should be same as rotate y axis by 90 degree", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([1, 0, 0], [0, 1, 0])),
        rotation4x4(0, 90 * TO_RADIANS, 0)
      );
    });

    it("LookAt [-1, 0, 0] Matrix should be same as rotate y axis by -90 degree", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([-1, 0, 0], [0, 1, 0])),
        rotation4x4(0, -90 * TO_RADIANS, 0)
      );
    });

    it("LookAt [0, 1, 0] with up [0 ,0 ,1] Matrix should be same as rotate x axis by -90 degree", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([0, 1, 0], [0, 0, 1])),
        rotation4x4(-90 * TO_RADIANS, 0, 0)
      );
    });

    it("LookAt [0, -1, 0] with up [0 ,0 , -1] Matrix should be same as rotate x axis by 90 degree", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([0, -1, 0], [0, 0, -1])),
        rotation4x4(90 * TO_RADIANS, 0, 0)
      );
    });

    it("LookAt Quaternion should be correct", () => {
      const v: Vec4 = [-1, -1, -1, 1];
      const look = lookAtQuat([-1, -1, -1], [0, 1, 0]);
      fuzzyAssert4(transform4(matrix4x4FromUnitQuatView(look), v), [
        0,
        0,
        -sqrt(3),
        1,
      ]);
    });

    it("LookAt Quaternion should be correct", () => {
      const v: Vec4 = [-2, -3, -4, 1];
      const look = lookAtQuat([2, 3, 4], [0, 1, 0]);
      fuzzyAssert4(transform4(matrix4x4FromUnitQuatView(look), v), [
        0,
        0,
        sqrt(29),
        1,
      ]);
    });
  });

  describe("Exponent Quaternion", () => {
    it("exponentiation of a quaternion should be corrent", () => {
      assert4(exponentQuat([3, 0, 0, 0]), [exp(3), 0, 0, 0]);
    });

    it("exponentiation of a quaternion should be corrent", () => {
      fuzzyAssert4(exponentQuat([5, 4, 4, 2]), [
        exp(5) * cos(6),
        (4 * exp(5) * sin(6)) / 6,
        (4 * exp(5) * sin(6)) / 6,
        (2 * exp(5) * sin(6)) / 6,
      ]);
    });

    it("exponentiation of a quaternion should be corrent", () => {
      const coff = sqrt(109);
      fuzzyAssert4(exponentQuat([7, 3, 6, 8]), [
        exp(7) * cos(coff),
        (3 * exp(7) * sin(coff)) / coff,
        (6 * exp(7) * sin(coff)) / coff,
        (8 * exp(7) * sin(coff)) / coff,
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
      fuzzyAssert4(inverseQuat([1, -2, 3, -4]), [
        1 / 30,
        2 / 30,
        -3 / 30,
        4 / 30,
      ]);
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
      fuzzyAssert4(normalizeQuat([1, 2, 3, 4]), [
        1 / sqrt(30),
        2 / sqrt(30),
        3 / sqrt(30),
        4 / sqrt(30),
      ]);
    });

    it("Normalize of a quaternion should be correct", () => {
      fuzzyAssert4(normalizeQuat([100, 0, 0, 0]), [1, 0, 0, 0]);
    });

    it("Normalize of a quaternion should be correct", () => {
      fuzzyAssert4(normalizeQuat([0, 6, 5, 2]), [
        0,
        6 / sqrt(65),
        5 / sqrt(65),
        2 / sqrt(65),
      ]);
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

  describe("Slerp Quaternion", () => {
    it("Slerp Quaternion on rotation on x-axis should be correct", () => {
      const m0 = rotation4x4(0, 0, 0);
      const m1 = rotation4x4(90 * TO_RADIANS, 0, 0);
      const m2 = rotation4x4(30 * TO_RADIANS, 0, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        1 / 3
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on x-axis should be correct", () => {
      const m0 = rotation4x4(0, 0, 0);
      const m1 = rotation4x4(90 * TO_RADIANS, 0, 0);
      const m2 = rotation4x4(45 * TO_RADIANS, 0, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.5
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on x-axis should be correct", () => {
      const m0 = rotation4x4(27 * TO_RADIANS, 0, 0);
      const m1 = rotation4x4(59 * TO_RADIANS, 0, 0);
      const m2 = rotation4x4(35 * TO_RADIANS, 0, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.25
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on y-axis should be correct", () => {
      const m0 = rotation4x4(0, 0, 0);
      const m1 = rotation4x4(0, 90 * TO_RADIANS, 0);
      const m2 = rotation4x4(0, 30 * TO_RADIANS, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        1 / 3
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on y-axis should be correct", () => {
      const m0 = rotation4x4(0, 0, 0);
      const m1 = rotation4x4(0, 90 * TO_RADIANS, 0);
      const m2 = rotation4x4(0, 45 * TO_RADIANS, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.5
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on y-axis should be correct", () => {
      const m0 = rotation4x4(0, 65 * TO_RADIANS, 0);
      const m1 = rotation4x4(0, 25 * TO_RADIANS, 0);
      const m2 = rotation4x4(0, 35 * TO_RADIANS, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.75
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on z-axis should be correct", () => {
      const m0 = rotation4x4(0, 0, 0);
      const m1 = rotation4x4(0, 0, 90 * TO_RADIANS);
      const m2 = rotation4x4(0, 0, 30 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        1 / 3
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on z-axis should be correct", () => {
      const m0 = rotation4x4(0, 0, 0);
      const m1 = rotation4x4(0, 0, 90 * TO_RADIANS);
      const m2 = rotation4x4(0, 0, 45 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.5
      );

      fuzzyAssert4(matrix4x4ToQuaternion(m2), q2);
    });

    it("Slerp Quaternion on rotation on z-axis should be correct", () => {
      const m0 = rotation4x4(0, 0, 0 * TO_RADIANS);
      const m1 = rotation4x4(0, 0, 5 * TO_RADIANS);
      const m2 = rotation4x4(0, 0, 1 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.2
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xy-axis should be correct", () => {
      const m0 = rotation4x4(45 * TO_RADIANS, 0, 0);
      const m1 = rotation4x4(45 * TO_RADIANS, 90 * TO_RADIANS, 0);
      const m2 = rotation4x4(45 * TO_RADIANS, 45 * TO_RADIANS, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.5
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xy-axis should be correct", () => {
      const m0 = rotation4x4(0 * TO_RADIANS, 45 * TO_RADIANS, 0);
      const m1 = rotation4x4(45 * TO_RADIANS, 45 * TO_RADIANS, 0);
      const m2 = rotation4x4(15 * TO_RADIANS, 45 * TO_RADIANS, 0);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        1 / 3
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xz-axis should be correct", () => {
      const m0 = rotation4x4(45 * TO_RADIANS, 0, 0);
      const m1 = rotation4x4(45 * TO_RADIANS, 0, 90 * TO_RADIANS);
      const m2 = rotation4x4(45 * TO_RADIANS, 0, 45 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.5
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xz-axis should be correct", () => {
      const m0 = rotation4x4(0 * TO_RADIANS, 0, 45 * TO_RADIANS);
      const m1 = rotation4x4(45 * TO_RADIANS, 0, 45 * TO_RADIANS);
      const m2 = rotation4x4(15 * TO_RADIANS, 0, 45 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        1 / 3
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on yz-axis should be correct", () => {
      const m0 = rotation4x4(0, 0 * TO_RADIANS, 45 * TO_RADIANS);
      const m1 = rotation4x4(0, 45 * TO_RADIANS, 45 * TO_RADIANS);
      const m2 = rotation4x4(0, 15 * TO_RADIANS, 45 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        1 / 3
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xz-axis should be correct", () => {
      const m0 = rotation4x4(0, 45 * TO_RADIANS, 0);
      const m1 = rotation4x4(0, 45 * TO_RADIANS, 90 * TO_RADIANS);
      const m2 = rotation4x4(0, 45 * TO_RADIANS, 45 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.5
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xyz-axis should be correct", () => {
      const m0 = rotation4x4(45 * TO_RADIANS, 34 * TO_RADIANS, 0);
      const m1 = rotation4x4(45 * TO_RADIANS, 34 * TO_RADIANS, 90 * TO_RADIANS);
      const m2 = rotation4x4(45 * TO_RADIANS, 34 * TO_RADIANS, 45 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.5
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xyz-axis should be correct", () => {
      const m0 = rotation4x4(6 * TO_RADIANS, 34 * TO_RADIANS, 387 * TO_RADIANS);
      const m1 = rotation4x4(6 * TO_RADIANS, 37 * TO_RADIANS, 387 * TO_RADIANS);
      const m2 = rotation4x4(6 * TO_RADIANS, 35 * TO_RADIANS, 387 * TO_RADIANS);

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        1 / 3
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });

    it("Slerp Quaternion on rotation on xyz-axis should be correct", () => {
      const m0 = rotation4x4(
        36 * TO_RADIANS,
        591 * TO_RADIANS,
        387 * TO_RADIANS
      );
      const m1 = rotation4x4(
        6 * TO_RADIANS,
        591 * TO_RADIANS,
        387 * TO_RADIANS
      );
      const m2 = rotation4x4(
        12 * TO_RADIANS,
        591 * TO_RADIANS,
        387 * TO_RADIANS
      );

      const q2 = slerpUnitQuat(
        normalizeQuat(matrix4x4ToQuaternion(m0)),
        normalizeQuat(matrix4x4ToQuaternion(m1)),
        0.8
      );

      fuzzyAssert4(normalizeQuat(matrix4x4ToQuaternion(m2)), q2);
    });
  });

  describe("axisQuat", () => {
    it("axis Quaternion should be correct", () => {
      fuzzyAssert3(axisQuat([1, 2, 3, 4]), [
        2 / sqrt(29),
        3 / sqrt(29),
        4 / sqrt(29),
      ]);
    });

    it("axis Quaternion should be correct", () => {
      fuzzyAssert3(axisQuat([1, 0, 0, 0]), [0, 0, 0]);
    });
  });

  describe("angleQuat", () => {
    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([0, 1, 1, 1]);
      fuzzyAssertNumber(angle, 180 * TO_RADIANS);
    });

    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([1, 1, 1, 1]);
      fuzzyAssertNumber(angle, 0 * TO_RADIANS);
    });

    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([-1, 1, 1, 1]);
      fuzzyAssertNumber(angle, 360 * TO_RADIANS);
    });

    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([0.5, 1, 1, 1]);
      fuzzyAssertNumber(angle, 120 * TO_RADIANS);
    });

    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([-0.5, 1, 1, 1]);
      fuzzyAssertNumber(angle, 240 * TO_RADIANS);
    });

    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([sqrt(3) / 2, 1, 1, 1]);
      fuzzyAssertNumber(angle, 60 * TO_RADIANS);
    });

    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([-sqrt(3) / 2, 1, 1, 1]);
      fuzzyAssertNumber(angle, 300 * TO_RADIANS);
    });

    it("angle Quaternion should be correct", () => {
      const angle = angleQuat([sqrt(2) / 2, 1, 1, 1]);
      fuzzyAssertNumber(angle, 90 * TO_RADIANS);
    });
  });

  describe("fromEulerAxisAngleToQuat", () => {
    it("axis(2, 3, 4) with degree 120 should be correct", () => {
      fuzzyAssert4(
        fromEulerAxisAngleToQuat([2, 3, 4], 120 * TO_RADIANS),
        [0.5, 0.3216338, 0.4824506, 0.6432675]
      );
    });

    it("axis(1, 0, 0) with degree 0 should be correct", () => {
      fuzzyAssert4(
        fromEulerAxisAngleToQuat([1, 0, 0], 0 * TO_RADIANS),
        [1, 0, 0, 0]
      );
    });

    it("axis(1, 0, 0) with degree 50 should be correct", () => {
      fuzzyAssert4(
        fromEulerAxisAngleToQuat([1, 0, 0], 50 * TO_RADIANS),
        [0.9063078, 0.4226183, 0, 0]
      );
    });

    it("axis(1, 1, 1) with degree 200 should be correct", () => {
      fuzzyAssert4(
        fromEulerAxisAngleToQuat([1, 1, 1], 200 * TO_RADIANS),
        [-0.1736482, 0.568579, 0.568579, 0.568579]
      );
    });

    it("axis(0, 1, 0) with degree 90 should be correct", () => {
      fuzzyAssert4(
        fromEulerAxisAngleToQuat([0, 1, 0], 90 * TO_RADIANS),
        [0.7071068, 0, 0.7071068, 0]
      );
    });

    it("axis(0, 0, 1) with degree 180 should be correct", () => {
      fuzzyAssert4(
        fromEulerAxisAngleToQuat([0, 0, 1], 180 * TO_RADIANS),
        [0, 0, 0, 1]
      );
    });
  });

  describe("eulerToQuat", () => {
    it("Euler angles [30 degree, 40 degree, 50 degree] should be correct", () => {
      fuzzyAssert4(
        eulerToQuat([30 * TO_RADIANS, 40 * TO_RADIANS, 50 * TO_RADIANS]),
        [0.8600422, 0.0808047, 0.4021985, 0.3033718]
      );
    });

    it("Should return [30 degree, 40 degree, 50 degree]", () => {
      fuzzyAssert3(
        toEulerFromQuat([0.8600422, 0.0808047, 0.4021985, 0.3033718]),
        [30 * TO_RADIANS, 40 * TO_RADIANS, 50 * TO_RADIANS]
      );
    });

    it("Euler angles [30 degree, 0 degree, 0 degree] should be correct", () => {
      fuzzyAssert4(
        eulerToQuat([30 * TO_RADIANS, 0 * TO_RADIANS, 0 * TO_RADIANS]),
        [0.9659258, 0.258819, 0, 0]
      );
    });

    it("Should return [30 degree, 0 degree, 0 degree]", () => {
      fuzzyAssert3(toEulerFromQuat([0.9659258, 0.258819, 0, 0]), [
        30 * TO_RADIANS,
        0,
        0,
      ]);
    });

    it("Euler angles [0 degree, 40 degree, 0 degree] should be correct", () => {
      fuzzyAssert4(
        eulerToQuat([0 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS]),
        [0.9396926, 0, 0.3420201, 0]
      );
    });

    it("Should return [0 degree, 40 degree, 0 degree]", () => {
      fuzzyAssert3(toEulerFromQuat([0.9396926, 0, 0.3420201, 0]), [
        0,
        40 * TO_RADIANS,
        0,
      ]);
    });

    it("Euler angles [0 degree, 0 degree, 50 degree] should be correct", () => {
      fuzzyAssert4(
        eulerToQuat([0 * TO_RADIANS, 0 * TO_RADIANS, 50 * TO_RADIANS]),
        [0.9063078, 0, 0, 0.4226183]
      );
    });

    it("Should return [0 degree, 0 degree, 50 degree]", () => {
      fuzzyAssert3(toEulerFromQuat([0.9063078, 0, 0, 0.4226183]), [
        0,
        0,
        50 * TO_RADIANS,
      ]);
    });

    it("Euler angles [30 degree, 40 degree, 0 degree] should be correct", () => {
      fuzzyAssert4(
        eulerToQuat([30 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS]),
        [0.9076734, 0.2432103, 0.3303661, -0.0885213]
      );
    });

    it("Should return [30 degree, 40 degree, 0 degree]", () => {
      fuzzyAssert3(
        toEulerFromQuat([0.9076734, 0.2432103, 0.3303661, -0.0885213]),
        [30 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS]
      );
    });
  });

  describe("EulerOrder", () => {
    it("xyz order (30, 40, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.xyz
        ),
        [30 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS]
      );
    });

    it("xyz order (30, 40, 50) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [230 * TO_RADIANS, 140 * TO_RADIANS, 250 * TO_RADIANS],
          EulerOrder.xyz
        ),
        [50 * TO_RADIANS, 40 * TO_RADIANS, 70 * TO_RADIANS]
      );
    });

    it("yxz order (30, 40, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 40 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.yxz
        ),
        [
          37.00045022 * TO_RADIANS,
          33.8258469 * TO_RADIANS,
          -2.7604772 * TO_RADIANS,
        ]
      );
    });

    it("yxz order (30, 0, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 0 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.yxz
        ),
        [30 * TO_RADIANS, 0 * TO_RADIANS, 20 * TO_RADIANS]
      );
    });

    it("yxz order (0, 60, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [0 * TO_RADIANS, 60 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.yxz
        ),
        [0 * TO_RADIANS, 60 * TO_RADIANS, 20 * TO_RADIANS]
      );
    });

    it("yxz order (70, 110, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [70 * TO_RADIANS, 110 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.yxz
        ),
        [
          97.0959699 * TO_RADIANS,
          18.747238 * TO_RADIANS,
          -111.1728322 * TO_RADIANS,
        ]
      );
    });

    it("yxz order (70, 0, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [70 * TO_RADIANS, 0 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.yxz
        ),
        [70 * TO_RADIANS, 0 * TO_RADIANS, 0 * TO_RADIANS]
      );
    });

    it("zxy order (30, 40, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 40 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.zxy
        ),
        [
          11.9226229 * TO_RADIANS,
          47.3092521 * TO_RADIANS,
          25.9026867 * TO_RADIANS,
        ]
      );
    });

    it("zxy order (33, 78, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [33 * TO_RADIANS, 78 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.zxy
        ),
        [33 * TO_RADIANS, 78 * TO_RADIANS, 0 * TO_RADIANS]
      );
    });

    it("zxy order (80, 0, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [80 * TO_RADIANS, 0 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.zxy
        ),
        [
          79.3724159 * TO_RADIANS,
          19.6834981 * TO_RADIANS,
          3.6164416 * TO_RADIANS,
        ]
      );
    });

    it("zxy order (0, 0, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [0 * TO_RADIANS, 0 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.zxy
        ),
        [0 * TO_RADIANS, 0 * TO_RADIANS, 20 * TO_RADIANS]
      );
    });

    it("zyx order (30, 40, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 40 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.zyx
        ),
        [
          22.8425762 * TO_RADIANS,
          43.9562698 * TO_RADIANS,
          -0.4626928 * TO_RADIANS,
        ]
      );
    });

    it("zyx order (30, 40, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.zyx
        ),
        [
          37.0045022 * TO_RADIANS,
          33.8258469 * TO_RADIANS,
          -22.7604772 * TO_RADIANS,
        ]
      );
    });

    it("zyx order (0, 40, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [0 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.zyx
        ),
        [0 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS]
      );
    });

    it("yzx order (30, 40, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 40 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.yzx
        ),
        [
          40.3272025 * TO_RADIANS,
          43.4460868 * TO_RADIANS,
          -7.4783506 * TO_RADIANS,
        ]
      );
    });

    it("yzx order (0, 134, 119) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [0 * TO_RADIANS, 134 * TO_RADIANS, 119 * TO_RADIANS],
          EulerOrder.yzx
        ),
        [-180 * TO_RADIANS, 46 * TO_RADIANS, -61 * TO_RADIANS]
      );
    });

    it("yzx order (0, 34, 19) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [0 * TO_RADIANS, 34 * TO_RADIANS, 19 * TO_RADIANS],
          EulerOrder.yzx
        ),
        [0 * TO_RADIANS, 34 * TO_RADIANS, 19 * TO_RADIANS]
      );
    });

    it("xzy order (30, 40, 20) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 40 * TO_RADIANS, 20 * TO_RADIANS],
          EulerOrder.xzy
        ),
        [
          13.9871036 * TO_RADIANS,
          37.1585561 * TO_RADIANS,
          25.4137676 * TO_RADIANS,
        ]
      );
    });

    it("xzy order (230, 40, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [230 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.xzy
        ),
        [-130 * TO_RADIANS, 40 * TO_RADIANS, 0 * TO_RADIANS]
      );
    });

    it("xzy order (30, 0, 50) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [30 * TO_RADIANS, 0 * TO_RADIANS, 50 * TO_RADIANS],
          EulerOrder.xzy
        ),
        [30 * TO_RADIANS, 0 * TO_RADIANS, 50 * TO_RADIANS]
      );
    });

    it("xzy order (230, 220, 0) should be correct", () => {
      fuzzyAssert3(
        toEulerXYZfromOrderedEuler(
          [230 * TO_RADIANS, 220 * TO_RADIANS, 0 * TO_RADIANS],
          EulerOrder.xzy
        ),
        [50 * TO_RADIANS, -40 * TO_RADIANS, -180 * TO_RADIANS]
      );
    });
  });

  describe("Transform Vector", () => {
    it("Should rotate on y-axis 90 degress", () => {
      const v = forward3();
      const q = fromEulerAxisAngleToQuat([0, 1, 0], 90 * TO_RADIANS);
      fuzzyAssert3(rotateVectorByUnitQuat(v, q), [-1, 0, 0]);
    });

    it("Should rotate on y-axis -90 degress", () => {
      const v = forward3();
      const q = fromEulerAxisAngleToQuat([0, 1, 0], -90 * TO_RADIANS);
      fuzzyAssert3(rotateVectorByUnitQuat(v, q), [1, 0, 0]);
    });

    it("Should rotate on x-axis 90 degress", () => {
      const v = forward3();
      const q = fromEulerAxisAngleToQuat([1, 0, 0], 90 * TO_RADIANS);
      fuzzyAssert3(rotateVectorByUnitQuat(v, q), [0, 1, 0]);
    });

    it("Should rotate on x-axis -90 degress", () => {
      const v = forward3();
      const q = fromEulerAxisAngleToQuat([1, 0, 0], -90 * TO_RADIANS);
      fuzzyAssert3(rotateVectorByUnitQuat(v, q), [0, -1, 0]);
    });

    it("Should rotate on z-axis 90 degress", () => {
      const v = forward3();
      const q = fromEulerAxisAngleToQuat([0, 0, 1], 90 * TO_RADIANS);
      fuzzyAssert3(rotateVectorByUnitQuat(v, q), [0, 0, -1]);
    });

    it("Should rotate on z-axis -90 degress", () => {
      const v = forward3();
      const q = fromEulerAxisAngleToQuat([0, 0, 1], -90 * TO_RADIANS);
      fuzzyAssert3(rotateVectorByUnitQuat(v, q), [0, 0, -1]);
    });
  });
});
