import { describe, it, test } from "bun:test";

import type { FixturePage } from "../harness/browser.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { worldToPixel2D } from "../harness/probe.js";
import { YELLOW } from "./palette.js";
import { CLEAR_PX, expectPixel, polar, px, sceneProps, use2DPage } from "./util.js";

/**
 * RingLayer: a ring of outer radius R and stroke `thickness` t (both pixels
 * at pixelRatio 1, centre in world space) covers the annulus R−t ≤ d ≤ R.
 * Probes sit on the middle of the stroke (d = R − t/2), in the hole (d = 0
 * and d = 0.3·R) and outside (d = 1.2·R), at eight angles.
 */
const CENTER: [number, number] = [100, 100];
const R = 50;
const T = 30;
const ANGLES = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4);
const PROPS = sceneProps([{ center: CENTER, radius: R, thickness: T, color: YELLOW }]);

async function at(page: FixturePage, d: number, color: typeof CLEAR_PX) {
  for (const a of ANGLES) {
    await expectPixel(page, worldToPixel2D(polar(CENTER, d, a)), color);
  }
}

describe("2D RingLayer", () => {
  const handle = use2DPage();

  it("colours its stroke and leaves the centre hole clear", async () => {
    await mountCycle(handle.page, "2d/ring", PROPS, async (page) => {
      await at(page, R - T / 2, px(YELLOW));
      await expectPixel(page, worldToPixel2D(CENTER), CLEAR_PX);
      await at(page, 0.3 * R, CLEAR_PX);
      await at(page, 1.2 * R, CLEAR_PX);
    });
  });

  // DEFECT: ring-layer.fs compares the squared normalised distance with 1 − thickness/R, so the stroke's inner edge sits at R·sqrt(1 − t/R) instead of R − t and rings render thinner than their thickness (report DELTAV-81)
  test.failing("covers its full thickness, down to R − t", async () => {
    await mountCycle(handle.page, "2d/ring", PROPS, async (page) => {
      // 2 px inside the stroke's inner edge.
      await at(page, R - T + 2, px(YELLOW));
    });
  });
});
