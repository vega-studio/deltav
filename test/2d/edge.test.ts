import { describe, it } from "bun:test";

import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  worldRectToPixel2D,
  worldToPixel2D,
} from "../harness/probe.js";
import { GREEN, type RGBA01, YELLOW } from "./palette.js";
import { CLEAR_PX, expectPixel, px, sceneProps, use2DPage } from "./util.js";

/**
 * EdgeLayer with EdgeScaleType.NONE: everything in world space. A thick edge
 * of width w covers the points within w/2 of its curve (no end caps).
 */
function edge(
  start: [number, number],
  end: [number, number],
  width: number,
  color: RGBA01,
  control?: [number, number][]
) {
  return { start, end, control, thickness: [width, width], startColor: color, endColor: color };
}

/** The quadratic Bézier point at t (the shader's BEZIER interpolation). */
function bezier(t: number, s: [number, number], c: [number, number], e: [number, number]) {
  const u = 1 - t;
  return [0, 1].map((i) => u * u * s[i] + 2 * t * u * c[i] + t * t * e[i]) as [number, number];
}

describe("2D EdgeLayer", () => {
  const handle = use2DPage();

  for (const width of [20, 40]) {
    it(`draws a horizontal LINE ${width} px wide`, async () => {
      // The line's footprint: from start to end, width/2 above and below.
      const world: PixelRect = { x: 30, y: 100 - width / 2, width: 140, height: width };
      await mountCycle(
        handle.page,
        "2d/edge",
        sceneProps([edge([30, 100], [170, 100], width, YELLOW)], { config: { edgeType: "LINE" } }),
        async (page) => {
          await expectPixel(page, worldToPixel2D([100, 100]), px(YELLOW));
          await expectRegion(page, worldRectToPixel2D(world), px(YELLOW));
          await expectOutside(page, worldRectToPixel2D(world), CLEAR_PX);
        }
      );
    });
  }

  it("draws a diagonal LINE along its segment", async () => {
    const s: [number, number] = [30, 30];
    const e: [number, number] = [170, 170];
    await mountCycle(
      handle.page,
      "2d/edge",
      sceneProps([edge(s, e, 12, GREEN)], { config: { edgeType: "LINE" } }),
      async (page) => {
        for (const t of [0.25, 0.5, 0.75]) {
          const p: [number, number] = [s[0] + (e[0] - s[0]) * t, s[1] + (e[1] - s[1]) * t];
          await expectPixel(page, worldToPixel2D(p), px(GREEN));
          // 12 px off the line along its normal (±(1, −1)/√2): past the 6 px half width.
          const n = 12 / Math.SQRT2;
          await expectPixel(page, worldToPixel2D([p[0] + n, p[1] - n]), CLEAR_PX);
          await expectPixel(page, worldToPixel2D([p[0] - n, p[1] + n]), CLEAR_PX);
        }
      }
    );
  });

  it("draws a BEZIER through its analytic curve points", async () => {
    const s: [number, number] = [30, 150];
    const c: [number, number] = [100, 30];
    const e: [number, number] = [170, 150];
    await mountCycle(
      handle.page,
      "2d/edge",
      sceneProps([edge(s, e, 10, YELLOW, [c])], { config: { edgeType: "BEZIER" } }),
      async (page) => {
        // t = 0.5: (100, 90); the tangent is horizontal there.
        const mid = bezier(0.5, s, c, e);
        await expectPixel(page, worldToPixel2D(mid), px(YELLOW));
        await expectPixel(page, worldToPixel2D([mid[0], mid[1] - 2]), px(YELLOW));
        await expectPixel(page, worldToPixel2D([mid[0], mid[1] + 2]), px(YELLOW));
        await expectPixel(page, worldToPixel2D([mid[0], mid[1] - 9]), CLEAR_PX);
        await expectPixel(page, worldToPixel2D([mid[0], mid[1] + 9]), CLEAR_PX);
        for (const t of [0.25, 0.75]) {
          await expectPixel(page, worldToPixel2D(bezier(t, s, c, e)), px(YELLOW));
        }
        // The chord midpoint and the control point are far from the curve.
        await expectPixel(page, worldToPixel2D([100, 150]), CLEAR_PX);
        await expectPixel(page, worldToPixel2D(c), CLEAR_PX);
      }
    );
  });
});
