import assert from "assert";
import { describe, it } from "mocha";
import { Transform } from "../src/3d/scene-graph/transform";
import {
  compare4x4,
  identity4,
  Mat4x4,
  rotation4x4,
  toString4x4,
  transform4
} from "../src/math/matrix";
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
  scaleQuat,
  slerpUnitQuat,
  toEulerFromQuat,
  toEulerXYZfromOrderedEuler,
  zeroQuat
} from "../src/math/quaternion";
import {
  compare1,
  compare3,
  compare4,
  fuzzyCompare4,
  Vec1,
  Vec3,
  Vec4
} from "../src/math/vector";
import { fail1, fail3, fail4, fuzzCompare3, fuzzCompare4 } from "./vector.test";

const { exp, cos, sin, sqrt } = Math;

const TO_RADIANS = Math.PI / 180;

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(
    expected
  )}`;
}

function fuzzyCompare3(v1: Vec3, v2: Vec3): boolean {
  return (
    Math.abs(v1[0] - v2[0]) <= 1e-6 &&
    Math.abs(v1[1] - v2[1]) <= 1e-6 &&
    Math.abs(v1[2] - v2[2]) <= 1e-6
  );
}

function assert1(actual: Vec1, expected: Vec1, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare1(actual, expected), true, fail1(actual, expected));
  } else {
    assert.equal(!compare1(actual, expected), true, fail1(actual, expected));
  }
}

function assert3(actual: Vec3, expected: Vec3, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare3(actual, expected), true, fail3(actual, expected));
  } else {
    assert.equal(!compare3(actual, expected), true, fail3(actual, expected));
  }
}

function assert4(
  actual: Quaternion,
  expected: Quaternion,
  shouldEqual: boolean = true
) {
  if (shouldEqual) {
    assert.equal(compare4(actual, expected), true, fail4(actual, expected));
  } else {
    assert.equal(!compare4(actual, expected), true, fail4(actual, expected));
  }
}

function fuzzyAssertNumber(
  actual: number,
  expected: number,
  shouldEqual: boolean = true
) {
  if (shouldEqual) {
    assert.equal(actual - expected <= 1e7, true, fail1([actual], [expected]));
  } else {
    assert.equal(actual - expected > 1e7, true, fail1([actual], [expected]));
  }
}

function fuzzyAssert3(
  actual: Vec3,
  expected: Vec3,
  shouldEqual: boolean = true
) {
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
  shouldEqual: boolean = true
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

function assert4x4(
  actual: Mat4x4,
  expected: Mat4x4,
  shouldEqual: boolean = true
) {
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

describe("Transforms", () => {
  describe("Matrix", () => {
    it("Should be identity", () => {
      const t = new Transform();
      assert4x4(t.matrix, identity4());
    });

    it("Should be identity after lookAt", () => {
      const t = new Transform();
      t.lookAt([0, 0, -1], [0, 1, 0]);
      assert4x4(t.matrix, identity4());
    });

    it("Should be identity for the view", () => {
      const t = new Transform();
      assert4x4(t.viewMatrix, identity4());
    });
  });

  describe("Vector", () => {
    it("Should rotate on the y-axis", () => {
      const t = new Transform();
      t.lookAt([-1, 0, -1], [0, 1, 0]);
      const v: Vec4 = [0, 0, -1, 1];

      fuzzyAssert4(transform4(t.matrix, v), [sqrt(0.5), 0, -sqrt(0.5), 1]);
    });
  });
});
