/**
 * These tests are to test the math the view provides to project coordinates from screen to world and vice versa
 */
import assert from "assert";
import {
  add3,
  add4by3,
  down3,
  fuzzyCompare2,
  fuzzyCompare4,
  left3,
  length3,
  right3,
  subtract3,
  up3,
  Vec2Compat,
  Vec3,
  Vec4,
  vec4,
} from "../ui/src/math/vector";
import { Bounds } from "../ui/src/math/primitives/bounds";
import { Camera, CameraProjectionType } from "../ui/src/util/camera";
import {
  compare4x4,
  identity4,
  Mat4x4,
  multiply4x4,
  projectToScreen,
  rotation4x4,
  toString4x4,
  transform4,
} from "../ui/src/math/matrix";
import { describe, it } from "@jest/globals";
import { fail2, fail4 } from "./vector.test";
import {
  fromEulerAxisAngleToQuat,
  lookAtQuat,
  matrix4x4FromUnitQuatView,
} from "../ui/src/math";
import { Projection3D } from "../ui/src/3d/view/projection-3d";
import { TO_RADIANS } from "../ui/src/constants";

const SCREEN = {
  width: 1024,
  height: 512,
  pixelRatio: 2,

  get renderWidth() {
    return this.width * this.pixelRatio;
  },

  get renderHeight() {
    return this.height * this.pixelRatio;
  },
};

const ORIGIN_CAMERA = new Camera({
  type: CameraProjectionType.PERSPECTIVE,
  width: SCREEN.renderWidth,
  height: SCREEN.renderHeight,
  near: 1,
  far: 1000,
  fov: 90 * TO_RADIANS,
});

const ORIGIN_CAMERA_ORTHO = new Camera({
  type: CameraProjectionType.ORTHOGRAPHIC,
  left: -SCREEN.renderWidth / 2,
  right: SCREEN.renderWidth / 2,
  top: SCREEN.renderHeight / 2,
  bottom: -SCREEN.renderHeight / 2,
  near: 1,
  far: 1000,
});

const ANGLED_CAMERA = new Camera({
  type: CameraProjectionType.PERSPECTIVE,
  width: SCREEN.renderWidth,
  height: SCREEN.renderHeight,
  near: 1,
  far: 1000,
  fov: 90 * TO_RADIANS,
});

ANGLED_CAMERA.lookAt([0, 1, 0], [0, 0, 1]);

const ODD_ANGLED_CAMERA = new Camera({
  type: CameraProjectionType.PERSPECTIVE,
  width: SCREEN.renderWidth,
  height: SCREEN.renderHeight,
  near: 1,
  far: 1000,
  fov: 90 * TO_RADIANS,
});

ODD_ANGLED_CAMERA.lookAt([-1, -1, -1], [0, 1, 0]);

const POSITION_CAMERA = new Camera({
  type: CameraProjectionType.PERSPECTIVE,
  width: SCREEN.renderWidth,
  height: SCREEN.renderHeight,
  near: 1,
  far: 1000,
  fov: 90 * TO_RADIANS,
});

POSITION_CAMERA.position = [10, 20, 30];
POSITION_CAMERA.lookAt([0, 0, 0], [0, 1, 0]);

const SIMPLE_VIEW = new Projection3D();
SIMPLE_VIEW.camera = ORIGIN_CAMERA;
SIMPLE_VIEW.pixelRatio = 2;
SIMPLE_VIEW.screenBounds = new Bounds<object>({
  x: 0,
  y: 0,
  width: SCREEN.width,
  height: SCREEN.height,
});
SIMPLE_VIEW.viewBounds = new Bounds<object>({
  x: 0,
  y: 0,
  width: SCREEN.renderWidth,
  height: SCREEN.renderHeight,
});

function fail4x4(actual: any, expected: any) {
  return `\n\nACTUAL: ${toString4x4(actual)},\nEXPECTED: ${toString4x4(
    expected
  )}`;
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

function assert2(actual: Vec2Compat, expected: Vec2Compat, shouldEqual = true) {
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

describe("View 3D projections", () => {
  describe("Project to screen", () => {
    it("Should project to the middle of the screen", () => {
      const v: Vec4 = [0, 0, -1, 1];
      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      let r = projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height
      );

      assert2(r, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2]);

      if (
        ORIGIN_CAMERA_ORTHO.projectionOptions.type !==
        CameraProjectionType.ORTHOGRAPHIC
      ) {
        return;
      }

      r = projectToScreen(
        ORIGIN_CAMERA_ORTHO.projection,
        v,
        SCREEN.renderWidth,
        SCREEN.renderHeight
      );

      assert2(r, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2]);
    });

    it("Should project to the middle of the screen near plane", () => {
      const v: Vec4 = [0, 0, -1, 1];
      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      let r = projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height
      );

      assert4(r, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2, -1, 1]);

      if (
        ORIGIN_CAMERA_ORTHO.projectionOptions.type !==
        CameraProjectionType.ORTHOGRAPHIC
      ) {
        return;
      }

      r = projectToScreen(
        ORIGIN_CAMERA_ORTHO.projection,
        v,
        SCREEN.renderWidth,
        SCREEN.renderHeight
      );

      assert2(r, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2, -1, 1]);
    });

    it("Should project to the middle of the screen far plane", () => {
      const v: Vec4 = [0, 0, -1000, 1];
      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      let r = projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height
      );

      assert4(r, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2, 1, 1]);

      if (
        ORIGIN_CAMERA_ORTHO.projectionOptions.type !==
        CameraProjectionType.ORTHOGRAPHIC
      ) {
        return;
      }

      r = projectToScreen(
        ORIGIN_CAMERA_ORTHO.projection,
        v,
        SCREEN.renderWidth,
        SCREEN.renderHeight
      );

      assert2(r, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2, 1, 1]);
    });

    it("Should project to the left of the screen", () => {
      let v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(0, 45 * TO_RADIANS, 0);
      transform4(r, v, v);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      let t = projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height
      );

      assert2(t, [0, SCREEN.renderHeight / 2]);

      if (
        ORIGIN_CAMERA_ORTHO.projectionOptions.type !==
        CameraProjectionType.ORTHOGRAPHIC
      ) {
        return;
      }

      v = [-SCREEN.renderWidth / 2, 0, -1, 1];

      t = projectToScreen(
        ORIGIN_CAMERA_ORTHO.projection,
        v,
        SCREEN.renderWidth,
        SCREEN.renderHeight
      );

      assert2(t, [0, SCREEN.renderHeight / 2]);
    });

    it("Should project to the right of the screen", () => {
      let v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(0, -45 * TO_RADIANS, 0);
      transform4(r, v, v);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth, SCREEN.renderHeight / 2]);

      if (
        ORIGIN_CAMERA_ORTHO.projectionOptions.type !==
        CameraProjectionType.ORTHOGRAPHIC
      ) {
        return;
      }

      v = [SCREEN.renderWidth / 2, 0, -1, 1];

      projectToScreen(
        ORIGIN_CAMERA_ORTHO.projection,
        v,
        SCREEN.renderWidth,
        SCREEN.renderHeight,
        v
      );

      assert2(v, [SCREEN.renderWidth, SCREEN.renderHeight / 2]);
    });

    it("Should project to the top of the screen", () => {
      let v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(26.5650511771 * TO_RADIANS, 0, 0);
      transform4(r, v, v);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, SCREEN.renderHeight]);

      if (
        ORIGIN_CAMERA_ORTHO.projectionOptions.type !==
        CameraProjectionType.ORTHOGRAPHIC
      ) {
        return;
      }

      v = [0, SCREEN.renderHeight / 2, -1, 1];

      projectToScreen(
        ORIGIN_CAMERA_ORTHO.projection,
        v,
        SCREEN.renderWidth,
        SCREEN.renderHeight,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, SCREEN.renderHeight]);
    });

    it("Should project to the bottom of the screen", () => {
      let v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(-26.5650511771 * TO_RADIANS, 0, 0);
      transform4(r, v, v);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        ORIGIN_CAMERA.projection,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, 0]);

      if (
        ORIGIN_CAMERA_ORTHO.projectionOptions.type !==
        CameraProjectionType.ORTHOGRAPHIC
      ) {
        return;
      }

      v = [0, -SCREEN.renderHeight / 2, -1, 1];

      projectToScreen(
        ORIGIN_CAMERA_ORTHO.projection,
        v,
        SCREEN.renderWidth,
        SCREEN.renderHeight,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, 0]);
    });
  });

  describe("Camera at origin view", () => {
    it("Should be identity quat", () => {
      assert4(lookAtQuat([0, 0, -1], [0, 1, 0]), [1, 0, 0, 0]);
    });

    it("Should be identity", () => {
      assert4x4(
        matrix4x4FromUnitQuatView(lookAtQuat([0, 0, -1], [0, 1, 0])),
        identity4()
      );
    });

    it("Should project to the middle of the screen", () => {
      const v: Vec4 = [0, 0, -1, 1];

      const m = multiply4x4(ORIGIN_CAMERA.projection, ORIGIN_CAMERA.view);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        m,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2]);
    });

    it("Should project to the left of the screen", () => {
      const v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(0, 45 * TO_RADIANS, 0);
      transform4(r, v, v);

      const m = multiply4x4(ORIGIN_CAMERA.projection, ORIGIN_CAMERA.view);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        m,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [0, SCREEN.renderHeight / 2]);
    });

    it("Should project to the right of the screen", () => {
      const v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(0, -45 * TO_RADIANS, 0);
      transform4(r, v, v);

      const m = multiply4x4(ORIGIN_CAMERA.projection, ORIGIN_CAMERA.view);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        m,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth, SCREEN.renderHeight / 2]);
    });

    it("Should project to the top of the screen", () => {
      const v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(26.5650511771 * TO_RADIANS, 0, 0);
      transform4(r, v, v);

      const m = multiply4x4(ORIGIN_CAMERA.projection, ORIGIN_CAMERA.view);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        m,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, SCREEN.renderHeight]);
    });

    it("Should project to the bottom of the screen", () => {
      const v: Vec4 = [0, 0, -1, 1];
      const r = rotation4x4(-26.5650511771 * TO_RADIANS, 0, 0);
      transform4(r, v, v);

      const m = multiply4x4(ORIGIN_CAMERA.projection, ORIGIN_CAMERA.view);

      if (
        ORIGIN_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        m,
        v,
        ORIGIN_CAMERA.projectionOptions.width,
        ORIGIN_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, 0]);
    });

    it("Should be to the right of the camera", () => {
      const v: Vec4 = [0, 0, -1, 1];
      const up: Vec4 = [0, 1, 0, 1];
      const side = vec4(right3(v, up), 1);
      assert4(transform4(ORIGIN_CAMERA.view, side), [1, 0, 0, 1]);
    });

    it("Should be to the left of the camera", () => {
      const v: Vec4 = [0, 0, -1, 1];
      const up: Vec4 = [0, 1, 0, 1];
      const side = vec4(left3(v, up), 1);

      assert4(transform4(ORIGIN_CAMERA.view, side), [-1, 0, 0, 1]);
    });
  });

  describe("Camera angled up", () => {
    it("Should be in front of the camera", () => {
      const v: Vec4 = [0, 1, 0, 1];

      assert4(transform4(ANGLED_CAMERA.view, v), [0, 0, -1, 1]);
    });

    it("Should not move", () => {
      const v: Vec4 = [1, 0, 0, 1];
      assert4(transform4(ANGLED_CAMERA.view, v), [1, 0, 0, 1]);
    });

    it("Should not move", () => {
      const v: Vec4 = [-1, 0, 0, 1];
      assert4(transform4(ANGLED_CAMERA.view, v), [-1, 0, 0, 1]);
    });

    it("Should move below the camera", () => {
      const v: Vec4 = [0, 0, -1, 1];
      assert4(transform4(ANGLED_CAMERA.view, v), [0, -1, 0, 1]);
    });

    it("Should move above the camera", () => {
      const v: Vec4 = [0, 0, 1, 1];
      assert4(transform4(ANGLED_CAMERA.view, v), [0, 1, 0, 1]);
    });
  });

  describe("Camera odd angle", () => {
    it("Should be in front of the camera", () => {
      const v: Vec4 = [-1, -1, -1, 1];

      assert4(transform4(ODD_ANGLED_CAMERA.view, v), [0, 0, -length3(v), 1]);
    });

    it("Should be behind the camera", () => {
      const v: Vec4 = [1, 1, 1, 1];

      assert4(transform4(ODD_ANGLED_CAMERA.view, v), [0, 0, length3(v), 1]);
    });

    it("Should be to the right of the camera", () => {
      const v: Vec4 = [-1, -1, -1, 1];
      const up: Vec4 = [0, 1, 0, 1];
      const side = vec4(right3(v, up), 1);

      assert4(transform4(ODD_ANGLED_CAMERA.view, side), [1, 0, 0, 1]);
    });

    it("Should be to the left of the camera", () => {
      const v: Vec4 = [-1, -1, -1, 1];
      const up: Vec4 = [0, 1, 0, 1];
      const side = vec4(left3(v, up), 1);

      assert4(transform4(ODD_ANGLED_CAMERA.view, side), [-1, 0, 0, 1]);
    });

    it("Should be above the camera", () => {
      const v: Vec4 = [-1, -1, -1, 1];
      const up: Vec4 = [0, 1, 0, 1];
      const above = vec4(up3(v, up), 1);

      assert4(transform4(ODD_ANGLED_CAMERA.view, above), [0, 1, 0, 1]);
    });

    it("Should be below the camera", () => {
      const v: Vec4 = [-1, -1, -1, 1];
      const up: Vec4 = [0, 1, 0, 1];
      const above = vec4(down3(v, up), 1);

      assert4(transform4(ODD_ANGLED_CAMERA.view, above), [0, -1, 0, 1]);
    });
  });

  describe("Camera positioned and angled", () => {
    it("Should project to the middle of the screen", () => {
      const v: Vec4 = [0, 0, 0, 1];

      const m = multiply4x4(POSITION_CAMERA.projection, POSITION_CAMERA.view);

      if (
        POSITION_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        m,
        v,
        POSITION_CAMERA.projectionOptions.width,
        POSITION_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth / 2, SCREEN.renderHeight / 2]);
    });

    it("Should be to the right of the camera", () => {
      const v: Vec3 = subtract3([0, 0, 0], POSITION_CAMERA.position);
      const up: Vec4 = [0, 1, 0, 1];
      const side = vec4(add3(POSITION_CAMERA.position, right3(v, up)), 1);

      assert4(transform4(POSITION_CAMERA.view, side), [1, 0, 0, 1]);
    });

    it("Should be to the left of the camera", () => {
      const v: Vec3 = subtract3([0, 0, 0], POSITION_CAMERA.position);
      const up: Vec4 = [0, 1, 0, 1];
      const side = vec4(add3(POSITION_CAMERA.position, left3(v, up)), 1);

      assert4(transform4(POSITION_CAMERA.view, side), [-1, 0, 0, 1]);
    });

    it("Should project to the right of the screen", () => {
      const v = vec4(subtract3([0, 0, 0], POSITION_CAMERA.position), 1);
      const axis: Vec3 = up3(
        subtract3([0, 0, 0], POSITION_CAMERA.position),
        [0, 1, 0]
      );
      const rot = matrix4x4FromUnitQuatView(
        fromEulerAxisAngleToQuat(axis, -45 * TO_RADIANS)
      );

      transform4(rot, v, v);

      const m = multiply4x4(POSITION_CAMERA.projection, POSITION_CAMERA.view);

      if (
        POSITION_CAMERA.projectionOptions.type !==
        CameraProjectionType.PERSPECTIVE
      ) {
        return;
      }

      projectToScreen(
        m,
        add4by3(v, POSITION_CAMERA.position, v),
        POSITION_CAMERA.projectionOptions.width,
        POSITION_CAMERA.projectionOptions.height,
        v
      );

      assert2(v, [SCREEN.renderWidth, SCREEN.renderHeight / 2]);
    });
  });
});
