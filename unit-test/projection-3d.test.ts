/**
 * These tests are to test the math the view provides to project coordinates from screen to world and vice versa
 */
import assert from 'assert';
import { describe, it } from 'mocha';
import { Projection3D } from '../src/3d/view/projection-3d';
import { TO_RADIANS } from '../src/constants';
import { lookAtQuat } from '../src/math';
import { compare4x4, identity4, Mat4x4, multiply4x4, projectToScreen, rotation4x4, toString4x4, transform4 } from '../src/math/matrix';
import { fuzzyCompare2, fuzzyCompare3, fuzzyCompare4, scale4, Vec2Compat, Vec3, Vec3Compat, Vec4 } from '../src/math/vector';
import { Bounds } from '../src/primitives/bounds';
import { Camera, CameraProjectionType } from '../src/util/camera';
import { fail2, fail3, fail4 } from './vector.test';

const SCREEN = {
  width: 1024,
  height: 512,
  pixelRatio: 2,

  get renderWidth() {
    return this.width * this.pixelRatio;
  },

  get renderHeight() {
    return this.height * this.pixelRatio;
  }
};

const ORIGIN_CAMERA: Camera = new Camera({
  type: CameraProjectionType.PERSPECTIVE,
  width: SCREEN.renderWidth,
  height: SCREEN.renderHeight,
  near: 1,
  far: 1000,
  fov: 90 * TO_RADIANS,
});

const SIMPLE_VIEW = new Projection3D();
SIMPLE_VIEW.camera = ORIGIN_CAMERA;
SIMPLE_VIEW.pixelRatio = 2;
SIMPLE_VIEW.screenBounds = new Bounds<{}>({
  x: 0,
  y: 0,
  width: SCREEN.width,
  height: SCREEN.height,
});
SIMPLE_VIEW.viewBounds = new Bounds<{}>({
  x: 0,
  y: 0,
  width: SCREEN.renderWidth,
  height: SCREEN.renderHeight,
});

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(expected)}`;
}

function assert4x4(actual: Mat4x4, expected: Mat4x4, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(compare4x4(actual, expected), true, fail4x4(actual, expected));
  }

  else {
    assert.equal(!compare4x4(actual, expected), true, fail4x4(actual, expected));
  }
}

function assert2(actual: Vec2Compat, expected: Vec2Compat, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzyCompare2(actual, expected, 1e-7), true, fail2(actual, expected));
  }

  else {
    assert.equal(!fuzzyCompare2(actual, expected, 1e-7), true, fail2(actual, expected));
  }
}

function assert3(actual: Vec3Compat, expected: Vec3Compat, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzyCompare3(actual, expected, 1e-7), true, fail3(actual, expected));
  }

  else {
    assert.equal(!fuzzyCompare3(actual, expected, 1e-7), true, fail3(actual, expected));
  }
}

function assert4(actual: Vec4, expected: Vec4, shouldEqual: boolean = true) {
  if (shouldEqual) {
    assert.equal(fuzzyCompare4(actual, expected, 1e-7), true, fail4(actual, expected));
  }

  else {
    assert.equal(!fuzzyCompare4(actual, expected, 1e-7), true, fail4(actual, expected));
  }
}

describe('View 3D projections', () => {
  describe("Project to screen", () => {
    it ("Should project to the middle of the screen", () => {
      const v: Vec4 = [0, 0, 1, 1];
      if (ORIGIN_CAMERA.projectionOptions.type !== CameraProjectionType.PERSPECTIVE) return;

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2]);
    });

    it ("Should project to the left of the screen", () => {
      const v: Vec4 = [0, 0, 1, 1];
      const r = rotation4x4(0, 45 * TO_RADIANS, 0);
      transform4(r, v, v);

      if (ORIGIN_CAMERA.projectionOptions.type !== CameraProjectionType.PERSPECTIVE) return;

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [0, SCREEN.renderHeight / 2]);
    });

    it ("Should project to the right of the screen", () => {
      const v: Vec4 = [0, 0, 1, 1];
      const r = rotation4x4(0, -45 * TO_RADIANS, 0);
      transform4(r, v, v);

      if (ORIGIN_CAMERA.projectionOptions.type !== CameraProjectionType.PERSPECTIVE) return;

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth, SCREEN.renderHeight / 2]);
    });

    it ("Should project to the top of the screen", () => {
      const v: Vec4 = [0, 0, 1, 1];
      const r = rotation4x4(26.5650511771 * TO_RADIANS, 0, 0);
      transform4(r, v, v);

      if (ORIGIN_CAMERA.projectionOptions.type !== CameraProjectionType.PERSPECTIVE) return;

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, SCREEN.renderHeight]);
    });

    it ("Should project to the bottom of the screen", () => {
      const v: Vec4 = [0, 0, 1, 1];
      const r = rotation4x4(-26.5650511771 * TO_RADIANS, 0, 0);
      transform4(r, v, v);

      if (ORIGIN_CAMERA.projectionOptions.type !== CameraProjectionType.PERSPECTIVE) return;

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, 0]);
    });
  });

  describe("Camera view", () => {
    it ('Should be identity quat', () => {
      assert4(lookAtQuat([0, 0, 1], [0, 1, 0]), [1, 0, 0, 0]);
    });
  });

  // it ('Should project from world to the screen', () => {

  // });
});
