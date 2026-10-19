import { afterEach, describe, it } from "bun:test";

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
  BLUE,
  eventually,
  expectBox,
  expectPixel,
  expectShape,
  update,
  VP,
} from "./helpers.js";

/**
 * Projection: one cube seen through a View3D. The cube is drawn by the
 * flat-colour CubeLayer subclass (test/fixtures/3d/flat-layers.ts) because the
 * built-in CubeLayer draws nothing (DEFECT, test/3d/layers.test.ts). Every
 * expected pixel comes from expect-math.ts: the cube's front face (inside,
 * probed 2 px in) and its whole silhouette (the clear colour 2 px outside).
 */
const CENTRE: V3 = [20, 10, 0];
const HALF: V3 = [10, 10, 10];

const PERSPECTIVE: CameraSpec = {
  type: "perspective",
  fov: Math.PI / 2,
  near: 1,
  far: 1000,
  position: [0, 0, 60],
};

const ORTHOGRAPHIC: CameraSpec = {
  type: "orthographic",
  near: 1,
  far: 1000,
  position: [0, 0, 60],
};

function sceneProps(
  camera: CameraSpec,
  centre: V3 = CENTRE,
  half: V3 = HALF
): IScene3DProps {
  return {
    ...BASE,
    camera,
    layer: "flat-cube",
    instances: [{ position: centre, size: half, color: BLUE }],
  };
}

async function expectCube(
  page: Parameters<typeof expectShape>[0],
  camera: CameraSpec,
  centre: V3 = CENTRE,
  half: V3 = HALF
) {
  await expectShape(
    page,
    projectFrontFace(centre, half, camera, VP),
    projectBox(centre, half, camera, VP),
    BLUE
  );
  // The projected centre of the front face has the cube's colour too.
  const c = project([centre[0], centre[1], centre[2] + half[2]], camera, VP);
  await expectPixel(page, c.x, c.y, BLUE);
}

describe("3D projection", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("perspective: a cube lands on its analytic pixels", async () => {
    // Front face z = 10 at distance 50, tan(45°) = 1: centre (20, 10) is
    // 20/50 NDC right and up → pixel (140, 60); half extent 10/50 → 20 px.
    const face = projectFrontFace(CENTRE, HALF, PERSPECTIVE, VP);
    expectBox(face, { left: 120, right: 160, top: 60, bottom: 100 });

    await mountCycle(handle.page, "3d/scene", sceneProps(PERSPECTIVE), (page) =>
      expectCube(page, PERSPECTIVE)
    );
  });

  it("orthographic: a cube lands one world unit per pixel from the centre", async () => {
    // Centre (20, 10) → pixel (120, 90); half extent 10 → 10 px.
    const face = projectFrontFace(CENTRE, HALF, ORTHOGRAPHIC, VP);
    expectBox(face, { left: 110, right: 130, top: 80, bottom: 100 });

    await mountCycle(
      handle.page,
      "3d/scene",
      sceneProps(ORTHOGRAPHIC),
      (page) => expectCube(page, ORTHOGRAPHIC)
    );
  });

  it("perspective: moving the camera moves the cube by the analytic amount", async () => {
    const target: CameraSpec = { ...PERSPECTIVE, position: [10, 20, 40] };
    // Camera-relative centre (10, -10), distance 30: pixel
    // (100 + 10/30*100, 100 + 10/30*100) = (133.3, 133.3), half 33.3 px.
    const face = projectFrontFace(CENTRE, HALF, target, VP);
    expectBox(face, { left: 100, top: 100, right: 500 / 3, bottom: 500 / 3 });

    await mountCycle(
      handle.page,
      "3d/scene",
      sceneProps(PERSPECTIVE),
      async (page) => {
        await expectCube(page, PERSPECTIVE);
        await update(page, sceneProps(target));
        await eventually(page, () => expectCube(page, target));
        await update(page, sceneProps(PERSPECTIVE));
        await eventually(page, () => expectCube(page, PERSPECTIVE));
      }
    );
  });

  it("orthographic: moving the camera shifts the cube pixel for pixel", async () => {
    const target: CameraSpec = { ...ORTHOGRAPHIC, position: [-30, 25, 80] };
    // Camera-relative centre (50, -15) → pixel (150, 115); depth is ignored.
    const face = projectFrontFace(CENTRE, HALF, target, VP);
    expectBox(face, { left: 140, right: 160, top: 105, bottom: 125 });

    await mountCycle(
      handle.page,
      "3d/scene",
      sceneProps(ORTHOGRAPHIC),
      async (page) => {
        await expectCube(page, ORTHOGRAPHIC);
        await update(page, sceneProps(target));
        await eventually(page, () => expectCube(page, target));
      }
    );
  });

  it("perspective: changing the FOV scales the cube about the view centre", async () => {
    // A smaller cube nearer the axis, so the zoomed one stays on the canvas.
    const centre: V3 = [8, -6, 0];
    const half: V3 = [8, 8, 8];
    // fov 60°: tan(30°) = 1/√3, so every offset from the view centre grows by
    // √3 compared with fov 90°. At 90° the front face (distance 52) spans
    // x 100 + [0, 16]/52*100 = [100, 130.8]; at 60° it spans [100, 153.3].
    const narrow: CameraSpec = { ...PERSPECTIVE, fov: Math.PI / 3 };
    const wide = projectFrontFace(centre, half, PERSPECTIVE, VP);
    const zoomed = projectFrontFace(centre, half, narrow, VP);
    expectBox(wide, {
      left: 100,
      right: 100 + 1600 / 52,
      top: 100 - 200 / 52,
      bottom: 100 + 1400 / 52,
    });
    expectBox(zoomed, {
      left: 100,
      right: 100 + (1600 / 52) * Math.sqrt(3),
      top: 100 - (200 / 52) * Math.sqrt(3),
      bottom: 100 + (1400 / 52) * Math.sqrt(3),
    });

    await mountCycle(
      handle.page,
      "3d/scene",
      sceneProps(PERSPECTIVE, centre, half),
      async (page) => {
        await expectCube(page, PERSPECTIVE, centre, half);
        await update(page, sceneProps(narrow, centre, half));
        await eventually(page, () => expectCube(page, narrow, centre, half));
      }
    );
  });
});
