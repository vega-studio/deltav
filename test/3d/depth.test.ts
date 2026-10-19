import { afterEach, describe, expect, it } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { mountCycle } from "../harness/mount-cycle.js";
import type { FixturePage } from "../harness/browser.js";
import type { IScene3DProps, InstanceSpec } from "../fixtures/3d/scene-props.js";
import { expectOutside, expectRegion, rgba01To255 } from "../harness/probe.js";
import {
  type CameraSpec,
  type PixelBox,
  intersect,
  projectBox,
  projectFrontFace,
  toRect,
  type V3,
} from "./expect-math.js";
import { BASE, BLUE, clear255, VP, YELLOW } from "./helpers.js";

/**
 * Depth testing: two overlapping flat-colour cubes at different depths
 * (test/fixtures/3d/flat-layers.ts; the built-in CubeLayer paints every cube
 * the same red). The material default is depthTest on with LESS_OR_EQUAL
 * (ui/src/gl/material.ts) and the view clears COLOR and DEPTH, so where the
 * cubes overlap the nearer one must show, whichever order they are drawn in.
 */
const CAMERA: CameraSpec = {
  type: "perspective",
  fov: Math.PI / 2,
  near: 1,
  far: 1000,
  position: [0, 0, 60],
};

const NEAR_CENTRE: V3 = [-8, 0, 10];
const NEAR_HALF: V3 = [10, 10, 10];
const FAR_CENTRE: V3 = [10, 5, -20];
const FAR_HALF: V3 = [15, 15, 15];

const NEAR: InstanceSpec = { position: NEAR_CENTRE, size: NEAR_HALF, color: BLUE };
const FAR: InstanceSpec = { position: FAR_CENTRE, size: FAR_HALF, color: YELLOW };

function props(instances: InstanceSpec[]): IScene3DProps {
  return { ...BASE, camera: CAMERA, layer: "flat-cube", instances };
}

/** The expected regions, all from expect-math.ts. */
function regions() {
  const nearFace = projectFrontFace(NEAR_CENTRE, NEAR_HALF, CAMERA, VP);
  const nearBox = projectBox(NEAR_CENTRE, NEAR_HALF, CAMERA, VP);
  const farFace = projectFrontFace(FAR_CENTRE, FAR_HALF, CAMERA, VP);
  const farBox = projectBox(FAR_CENTRE, FAR_HALF, CAMERA, VP);
  // Near face: z = 20 at distance 40 → x 100 + [-18, 2] * 2.5 = [55, 105].
  // Far face: z = -5 at distance 65 → x 100 + [-5, 25] / 0.65 = [92.3, 138.5].
  const overlap = intersect(nearFace, farFace)!;
  // The far cube's face right of the near cube's whole silhouette.
  const farOnly: PixelBox = { ...farFace, left: nearBox.right };
  const union: PixelBox = {
    left: Math.min(nearBox.left, farBox.left),
    top: Math.min(nearBox.top, farBox.top),
    right: Math.max(nearBox.right, farBox.right),
    bottom: Math.max(nearBox.bottom, farBox.bottom),
  };
  return { nearFace, overlap, farOnly, union };
}

async function expectDepth(page: FixturePage) {
  const r = regions();
  // Overlap: the near (blue) cube wins.
  await expectRegion(page, toRect(r.overlap), rgba01To255(BLUE));
  // The rest of the near face is blue too, the uncovered far face yellow.
  await expectRegion(page, toRect(r.nearFace), rgba01To255(BLUE));
  await expectRegion(page, toRect(r.farOnly), rgba01To255(YELLOW));
  // Nothing outside both silhouettes.
  await expectOutside(page, toRect(r.union), clear255());
}

describe("3D depth", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("the expected regions are what the geometry says", () => {
    const r = regions();
    expect(r.overlap.left).toBeCloseTo(100 - 500 / 65, 6);
    expect(r.overlap.right).toBeCloseTo(105, 6);
    // The overlap and the far-only region are big enough to probe.
    expect(r.overlap.right - r.overlap.left).toBeGreaterThan(10);
    expect(r.farOnly.right - r.farOnly.left).toBeGreaterThan(10);
  });

  it("the nearer cube shows where they overlap (far cube drawn first)", async () => {
    await mountCycle(handle.page, "3d/scene", props([FAR, NEAR]), expectDepth);
  });

  it("swapping the instance order does not change the result (near cube drawn first)", async () => {
    await mountCycle(handle.page, "3d/scene", props([NEAR, FAR]), expectDepth);
  });
});
