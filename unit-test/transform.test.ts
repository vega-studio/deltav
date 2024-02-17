import assert from "assert";
import {
  compare4x4,
  identity4,
  Mat4x4,
  toString4x4,
  transform4,
} from "../ui/src/math/matrix";
import { describe, it } from "@jest/globals";
import { fail4, fuzzCompare4 } from "./vector.test";
import { Quaternion } from "../ui/src/math/quaternion";
import { Transform } from "../ui/src/3d/scene-graph/transform";
import { Vec4 } from "../ui/src/math/vector";

const { sqrt } = Math;

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(
    expected
  )}`;
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

describe("Transforms", () => {
  describe("Matrix", () => {
    it("Should be identity", () => {
      const t = new Transform();
      assert4x4(t.matrix, identity4());
    });

    it("Should be identity after lookAt", () => {
      const t = new Transform();
      t.lookAtLocal([0, 0, -1], [0, 1, 0]);
      assert4x4(t.matrix, identity4());
    });

    it("Should be identity for the view", () => {
      const t = new Transform();
      assert4x4(t.viewMatrix, identity4());
    });
  });

  describe("Vector", () => {
    it("Should rotate model on the y-axis", () => {
      const t = new Transform();
      t.lookAtLocal([-1, 0, -1], [0, 1, 0]);
      const v: Vec4 = [0, 0, -1, 1];

      fuzzyAssert4(transform4(t.matrix, v), [-sqrt(0.5), 0, -sqrt(0.5), 1]);
    });
  });
});
