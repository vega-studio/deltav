import { afterEach, describe, it, test } from "bun:test";

import { type FixturePage, useFixturePage } from "../harness/browser.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { expectRegion } from "../harness/probe.js";
import type { IScene3DProps, InstanceSpec } from "../fixtures/3d/scene-props.js";
import {
  type CameraSpec,
  projectBox,
  projectFrontFace,
  type V3,
} from "./expect-math.js";
import {
  BASE,
  BLUE,
  clear255,
  expectShape,
  VP,
  YELLOW,
} from "./helpers.js";

/**
 * Near and far clipping: a shape wholly in front of the near plane, beyond
 * the far plane or behind the camera is not drawn. Every case also draws a
 * control cube inside the frustum (blue) and asserts its exact pixels, so an
 * all-clear canvas cannot pass by accident. Flat-colour cubes
 * (test/fixtures/3d/flat-layers.ts); the clipped cube is yellow.
 */
const PERSPECTIVE: CameraSpec = {
  type: "perspective",
  fov: Math.PI / 2,
  near: 5,
  far: 50,
  position: [0, 0, 0],
};

const ORTHOGRAPHIC: CameraSpec = {
  type: "orthographic",
  near: 20,
  far: 100,
  position: [0, 0, 0],
};

/** Inside both frusta: distance 17–23 (perspective) — left of centre. */
const CONTROL_CENTRE: V3 = [-6, 4, -20];
const CONTROL_HALF: V3 = [3, 3, 3];
const CONTROL: InstanceSpec = {
  position: CONTROL_CENTRE,
  size: CONTROL_HALF,
  color: BLUE,
};

/** Orthographic control: distance 45–55, one unit per pixel, left of centre. */
const ORTHO_CONTROL_CENTRE: V3 = [-40, 20, -50];
const ORTHO_CONTROL_HALF: V3 = [10, 10, 5];
const ORTHO_CONTROL: InstanceSpec = {
  position: ORTHO_CONTROL_CENTRE,
  size: ORTHO_CONTROL_HALF,
  color: BLUE,
};

function props(camera: CameraSpec, instances: InstanceSpec[]): IScene3DProps {
  return { ...BASE, camera, layer: "flat-cube", instances };
}

async function expectControl(page: FixturePage, camera: CameraSpec) {
  const ortho = camera.type === "orthographic";
  const centre = ortho ? ORTHO_CONTROL_CENTRE : CONTROL_CENTRE;
  const half = ortho ? ORTHO_CONTROL_HALF : CONTROL_HALF;
  await expectShape(
    page,
    projectFrontFace(centre, half, camera, VP),
    projectBox(centre, half, camera, VP),
    BLUE
  );
}

/**
 * The clipped cube is nowhere: the canvas outside the control is clear.
 * Probes the right half of the canvas (the controls sit left of centre).
 */
async function expectRightHalfClear(page: FixturePage) {
  await expectRegion(page, { x: 110, y: 0, width: 90, height: 200 }, clear255(), {
    inset: 1,
    steps: 9,
  });
}

describe("3D near and far clipping", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  describe("perspective", () => {
    it("a cube wholly in front of the near plane is not drawn", async () => {
      // Distance 1.5–3.5 < near 5. Unclipped it would cover most of the
      // canvas (half extent 2 at distance 1.5 is 133 px).
      const clipped: InstanceSpec = {
        position: [2, 0, -2.5],
        size: [2, 2, 1],
        color: YELLOW,
      };
      await mountCycle(
        handle.page,
        "3d/scene",
        props(PERSPECTIVE, [CONTROL, clipped]),
        async (page) => {
          await expectControl(page, PERSPECTIVE);
          await expectRightHalfClear(page);
        }
      );
    });

    it("a cube wholly beyond the far plane is not drawn", async () => {
      // Distance 75–85 > far 50; unclipped its face would sit around
      // x 100 + 30/75*100 = 140.
      const clipped: InstanceSpec = {
        position: [30, 0, -80],
        size: [5, 5, 5],
        color: YELLOW,
      };
      await mountCycle(
        handle.page,
        "3d/scene",
        props(PERSPECTIVE, [CONTROL, clipped]),
        async (page) => {
          await expectControl(page, PERSPECTIVE);
          await expectRightHalfClear(page);
        }
      );
    });

    it("a cube behind the camera is not drawn", async () => {
      const clipped: InstanceSpec = {
        position: [10, 0, 20],
        size: [5, 5, 5],
        color: YELLOW,
      };
      await mountCycle(
        handle.page,
        "3d/scene",
        props(PERSPECTIVE, [CONTROL, clipped]),
        async (page) => {
          await expectControl(page, PERSPECTIVE);
          await expectRightHalfClear(page);
        }
      );
    });

    it("the control alone: the scene is only the control cube", async () => {
      await mountCycle(
        handle.page,
        "3d/scene",
        props(PERSPECTIVE, [CONTROL]),
        async (page) => {
          await expectControl(page, PERSPECTIVE);
          await expectRightHalfClear(page);
        }
      );
    });
  });

  describe("orthographic", () => {
    it("a cube wholly beyond the far plane is not drawn", async () => {
      // Distance 145–155 > far 100.
      const clipped: InstanceSpec = {
        position: [50, 0, -150],
        size: [10, 10, 5],
        color: YELLOW,
      };
      await mountCycle(
        handle.page,
        "3d/scene",
        props(ORTHOGRAPHIC, [ORTHO_CONTROL, clipped]),
        async (page) => {
          await expectControl(page, ORTHOGRAPHIC);
          await expectRightHalfClear(page);
        }
      );
    });

    // DEFECT: orthographic4x4 maps camera-space z to (near - z) / (far - near), so the visible depth range is z in [2*near - far, far] instead of [-far, -near]: geometry in front of the near plane is drawn (report DELTAV-87)
    test.failing("a cube wholly in front of the near plane is not drawn", async () => {
      // Distance 8–12 < near 20.
      const clipped: InstanceSpec = {
        position: [50, 0, -10],
        size: [10, 10, 2],
        color: YELLOW,
      };
      await mountCycle(
        handle.page,
        "3d/scene",
        props(ORTHOGRAPHIC, [ORTHO_CONTROL, clipped]),
        async (page) => {
          await expectControl(page, ORTHOGRAPHIC);
          await expectRightHalfClear(page);
        }
      );
    });

    // DEFECT: orthographic4x4 maps camera-space z to (near - z) / (far - near), so the visible depth range is z in [2*near - far, far] instead of [-far, -near]: geometry between far - 2*near and far is clipped (report DELTAV-87)
    test.failing("a cube between the near and far planes is drawn", async () => {
      // Distance 78–82, inside [near 20, far 100]; one unit per pixel:
      // centre (50, 0) → pixel (150, 100), half 10.
      const centre: V3 = [50, 0, -80];
      const half: V3 = [10, 10, 2];
      await mountCycle(
        handle.page,
        "3d/scene",
        props(ORTHOGRAPHIC, [
          ORTHO_CONTROL,
          { position: centre, size: half, color: YELLOW },
        ]),
        async (page) => {
          await expectControl(page, ORTHOGRAPHIC);
          await expectShape(
            page,
            projectFrontFace(centre, half, ORTHOGRAPHIC, VP),
            projectBox(centre, half, ORTHOGRAPHIC, VP),
            YELLOW
          );
        }
      );
    });

    it("the control alone: the scene is only the control cube", async () => {
      await mountCycle(
        handle.page,
        "3d/scene",
        props(ORTHOGRAPHIC, [ORTHO_CONTROL]),
        async (page) => {
          await expectControl(page, ORTHOGRAPHIC);
          await expectRightHalfClear(page);
        }
      );
    });
  });
});
