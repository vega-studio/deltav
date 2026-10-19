import { afterEach, describe, it, test } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { mountCycle } from "../harness/mount-cycle.js";
import type { IScene3DProps } from "../fixtures/3d/scene-props.js";
import {
  type CameraSpec,
  project,
  projectBox,
  projectFrontFace,
  type V3,
} from "./expect-math.js";
import {
  BASE,
  expectAllClear,
  expectShape,
  expectTriangle,
  GREEN,
  RED,
  VP,
  YELLOW,
} from "./helpers.js";

/**
 * The 3D layers: the built-in CubeLayer and TriangleLayer, the triangle
 * geometry, and face culling and winding.
 *
 * The built-in layers paint red (vec4(1, 0, 0, 1)); the cube's edges within
 * 1 % of a face border are black (docs/3d/layers.md), well inside the 2 px
 * probe inset. Their flat-colour subclasses (test/fixtures/3d/flat-layers.ts)
 * keep the geometry and material and paint the instance colour.
 */
const CAMERA: CameraSpec = {
  type: "perspective",
  fov: Math.PI / 2,
  near: 1,
  far: 1000,
  position: [0, 0, 60],
};

const CUBE_CENTRE: V3 = [-20, 15, 0];
const CUBE_HALF: V3 = [12, 12, 12];

/** Triangle size 30 at the origin: vertices (0, 30), (30, -30), (-30, -30). */
const TRI_SIZE = 30;
const TRI_VERTS: V3[] = [
  [0, TRI_SIZE, 0],
  [TRI_SIZE, -TRI_SIZE, 0],
  [-TRI_SIZE, -TRI_SIZE, 0],
];

function triangleProps(
  layer: IScene3DProps["layer"],
  extra: Partial<IScene3DProps> = {},
  rotationY = 0
): IScene3DProps {
  return {
    ...BASE,
    camera: CAMERA,
    layer,
    instances: [{ position: [0, 0, 0], size: TRI_SIZE, rotationY, color: GREEN }],
    ...extra,
  };
}

/**
 * The analytic pixels of the triangle: distance 60, tan(45°) = 1, so 30 world
 * units are 50 px: (100, 50), (150, 150), (50, 150). Rotating it 180° about Y
 * maps (x, y, 0) to (-x, y, 0), the same set of points, so the silhouette is
 * unchanged and only the winding flips.
 */
function trianglePixels() {
  const [a, b, c] = TRI_VERTS.map((p) => project(p, CAMERA, VP));
  return [a, b, c] as [typeof a, typeof a, typeof a];
}

describe("3D layers", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  // DEFECT: the built-in CubeLayer/TriangleLayer `transform` attribute reads `(o.transform || IdentityTransform).matrix`, which touches no instance observable, so it is never uploaded (all-zero mat4) and nothing is drawn (report DELTAV-85)
  test.failing("CubeLayer draws a cube at its analytic pixels", async () => {
    await mountCycle(
      handle.page,
      "3d/scene",
      {
        ...BASE,
        camera: CAMERA,
        layer: "cube",
        instances: [{ position: CUBE_CENTRE, size: CUBE_HALF }],
      },
      (page) =>
        expectShape(
          page,
          projectFrontFace(CUBE_CENTRE, CUBE_HALF, CAMERA, VP),
          projectBox(CUBE_CENTRE, CUBE_HALF, CAMERA, VP),
          RED
        )
    );
  });

  // DEFECT: the built-in CubeLayer/TriangleLayer `transform` attribute reads `(o.transform || IdentityTransform).matrix`, which touches no instance observable, so it is never uploaded (all-zero mat4) and nothing is drawn (report DELTAV-85)
  test.failing("TriangleLayer draws a triangle at its analytic pixels", async () => {
    await mountCycle(handle.page, "3d/scene", triangleProps("triangle"), (page) =>
      expectTriangle(page, trianglePixels(), RED)
    );
  });

  it("the cube's control: an empty scene is all clear", async () => {
    // Guards the failing cases above: they fail because nothing is drawn, not
    // because the scene leaves junk on the canvas.
    await mountCycle(
      handle.page,
      "3d/scene",
      { ...BASE, camera: CAMERA, layer: "cube", instances: [] },
      (page) => expectAllClear(page)
    );
  });

  it("CubeLayer geometry: a size-[12,12,12] cube spans ±12 world units", async () => {
    // docs/3d/layers.md: vertices span ±1, so `size` is a half extent.
    await mountCycle(
      handle.page,
      "3d/scene",
      {
        ...BASE,
        camera: CAMERA,
        layer: "flat-cube",
        instances: [{ position: CUBE_CENTRE, size: CUBE_HALF, color: YELLOW }],
      },
      (page) =>
        expectShape(
          page,
          projectFrontFace(CUBE_CENTRE, CUBE_HALF, CAMERA, VP),
          projectBox(CUBE_CENTRE, CUBE_HALF, CAMERA, VP),
          YELLOW
        )
    );
  });

  it("TriangleLayer geometry: the vertices land at the analytic pixels", async () => {
    await mountCycle(
      handle.page,
      "3d/scene",
      triangleProps("flat-triangle"),
      (page) => expectTriangle(page, trianglePixels(), GREEN)
    );
  });

  describe("culling and winding", () => {
    // docs/3d/layers.md, Gotchas: the layers' `cullSide` key is not read and
    // the default `materialOptions` (transparentShapeBlending) set
    // `culling: NONE`, so by default the triangle is drawn from both sides.
    it("by default the triangle is drawn facing the camera and turned 180° about Y", async () => {
      for (const rotationY of [0, Math.PI]) {
        await mountCycle(
          handle.page,
          "3d/scene",
          triangleProps("flat-triangle", {}, rotationY),
          (page) => expectTriangle(page, trianglePixels(), GREEN)
        );
      }
    });

    // Facing the camera the vertices (100, 50), (150, 150), (50, 150) run
    // clockwise on screen (GL window coordinates, y up: the cross product of
    // the first two edges is negative). A CullSide names the winding that is
    // culled (gl-state.ts applyCullFace: CW → frontFace(CCW) + cullFace(BACK),
    // CCW → frontFace(CW) + cullFace(BACK)). So culling CW culls the facing
    // triangle and draws the turned one, now counter-clockwise; culling CCW
    // is the mirror case.
    it("culling CW culls the clockwise (facing) side and draws the turned one", async () => {
      await mountCycle(
        handle.page,
        "3d/scene",
        triangleProps("flat-triangle", { culling: "cw" }, 0),
        (page) => expectAllClear(page)
      );
      await mountCycle(
        handle.page,
        "3d/scene",
        triangleProps("flat-triangle", { culling: "cw" }, Math.PI),
        (page) => expectTriangle(page, trianglePixels(), GREEN)
      );
    });

    it("culling CCW draws the facing side and culls the turned one", async () => {
      await mountCycle(
        handle.page,
        "3d/scene",
        triangleProps("flat-triangle", { culling: "ccw" }, 0),
        (page) => expectTriangle(page, trianglePixels(), GREEN)
      );
      await mountCycle(
        handle.page,
        "3d/scene",
        triangleProps("flat-triangle", { culling: "ccw" }, Math.PI),
        (page) => expectAllClear(page)
      );
    });
  });
});
