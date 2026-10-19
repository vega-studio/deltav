import { afterEach, describe, it, test } from "bun:test";

import { type FixturePage, useFixturePage } from "../harness/browser.js";
import { mountCycle } from "../harness/mount-cycle.js";
import type { ILayer2DIn3DProps } from "../fixtures/3d/scene-props.js";
import {
  boundsOf,
  type CameraSpec,
  project,
  type V3,
} from "./expect-math.js";
import { BASE, expectBox, expectShape, GREEN, VP } from "./helpers.js";

/**
 * 2D in 3D (`createLayer2Din3D`, ui/src/3d/view/layer-2d-in-3d.ts): a
 * top-left-anchored RectangleLayer rectangle with an identity Control2D is
 * mapped onto a 3D plane and seen through a View3D. docs/3d/view-and-projection.md:
 * with Axis2D.XY the 2D (x, y) lands on world (x, y); with Axis2D.XZ on world
 * (x, z) (the shader swizzles `world.xzy`, so the 2D depth, 0, becomes world
 * y). The rectangle covers 2D [x, x + w] × [y, y + h].
 */
const RECT = {
  position: [10, 20] as [number, number],
  size: [40, 30] as [number, number],
  color: GREEN,
};

/** The rectangle's corners in world space for a plane mapping. */
function worldCorners(axis: "XY" | "XZ"): V3[] {
  const [x, y] = RECT.position;
  const [w, h] = RECT.size;
  const corners: [number, number][] = [
    [x, y],
    [x + w, y + h],
  ];
  return corners.map(([u, v]) => (axis === "XY" ? [u, v, 0] : [u, 0, v]) as V3);
}

function expectedBox(axis: "XY" | "XZ", camera: CameraSpec) {
  return boundsOf(worldCorners(axis).map((p) => project(p, camera, VP)));
}

function props(axis: "XY" | "XZ", camera: CameraSpec): ILayer2DIn3DProps {
  return { ...BASE, camera, axis, rect: RECT };
}

async function expectRect(page: FixturePage, axis: "XY" | "XZ", camera: CameraSpec) {
  const box = expectedBox(axis, camera);
  await expectShape(page, box, box, GREEN);
}

/** Looking at the XY plane from +z. */
const FRONT_PERSPECTIVE: CameraSpec = {
  type: "perspective",
  fov: Math.PI / 2,
  near: 1,
  far: 1000,
  position: [0, 0, 100],
};
const FRONT_ORTHOGRAPHIC: CameraSpec = {
  type: "orthographic",
  near: 1,
  far: 1000,
  position: [0, 0, 100],
};
/**
 * Looking straight down at the XZ plane from +y with `Camera.lookAt`, world
 * -z up on screen.
 */
const TOP_ORTHOGRAPHIC: CameraSpec = {
  type: "orthographic",
  near: 1,
  far: 1000,
  position: [0, 100, 0],
  lookAt: { target: [0, 0, 0], up: [0, 0, -1] },
};
const TOP_PERSPECTIVE: CameraSpec = {
  type: "perspective",
  fov: Math.PI / 2,
  near: 1,
  far: 1000,
  position: [0, 100, 0],
  lookAt: { target: [0, 0, 0], up: [0, 0, -1] },
};

describe("2D layers in a 3D view", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("the expected boxes are what the mapping says", () => {
    // XY, distance 100 with tan(45°) = 1 (or orthographic): one unit per
    // pixel, y up: x [110, 150], y 100 - [20, 50] = [50, 80].
    const xy = { left: 110, right: 150, top: 50, bottom: 80 };
    expectBox(expectedBox("XY", FRONT_PERSPECTIVE), xy);
    expectBox(expectedBox("XY", FRONT_ORTHOGRAPHIC), xy);
    // XZ seen from above: world +z is screen down, so y 100 + [20, 50].
    const xz = { left: 110, right: 150, top: 120, bottom: 150 };
    expectBox(expectedBox("XZ", TOP_ORTHOGRAPHIC), xz);
    expectBox(expectedBox("XZ", TOP_PERSPECTIVE), xz);
  });

  // DEFECT: Axis2D.XY's world2DXY module reuses the View2D projection fragment, which calls `viewProjection`, but the module declares no `viewProjection` uniform, so the vertex shader does not compile ("'viewProjection' : undeclared identifier") and nothing is drawn (report DELTAV-88)
  test.failing("Axis2D.XY, perspective: the rectangle lands on the XY plane", async () => {
    await mountCycle(
      handle.page,
      "3d/layer-2d-in-3d",
      props("XY", FRONT_PERSPECTIVE),
      (page) => expectRect(page, "XY", FRONT_PERSPECTIVE)
    );
  });

  // DEFECT: Axis2D.XY's world2DXY module reuses the View2D projection fragment, which calls `viewProjection`, but the module declares no `viewProjection` uniform, so the vertex shader does not compile ("'viewProjection' : undeclared identifier") and nothing is drawn (report DELTAV-88)
  test.failing("Axis2D.XY, orthographic: the rectangle lands on the XY plane", async () => {
    await mountCycle(
      handle.page,
      "3d/layer-2d-in-3d",
      props("XY", FRONT_ORTHOGRAPHIC),
      (page) => expectRect(page, "XY", FRONT_ORTHOGRAPHIC)
    );
  });

  it("Axis2D.XZ, orthographic from above: the rectangle lands on the XZ plane", async () => {
    await mountCycle(
      handle.page,
      "3d/layer-2d-in-3d",
      props("XZ", TOP_ORTHOGRAPHIC),
      (page) => expectRect(page, "XZ", TOP_ORTHOGRAPHIC)
    );
  });

  it("Axis2D.XZ, perspective from above: the rectangle lands on the XZ plane", async () => {
    await mountCycle(
      handle.page,
      "3d/layer-2d-in-3d",
      props("XZ", TOP_PERSPECTIVE),
      (page) => expectRect(page, "XZ", TOP_PERSPECTIVE)
    );
  });
});
