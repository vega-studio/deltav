import { describe, it, test } from "@jest/globals";

import { mountCycle } from "../harness/mount-cycle.js";
import { worldToPixel2D } from "../harness/probe.js";
import { MAGENTA } from "./palette.js";
import { CLEAR_PX, expectPixel, polar, px, sceneProps, use2DPage } from "./util.js";

/**
 * ArcLayer: an arc of radius r (the stroke's middle), thickness w and angle
 * span [a0, a1] covers the points at distance r ± w/2 from the centre whose
 * angle lies in the span. World +y is down, so angle π/2 points down.
 */
const CENTER: [number, number] = [100, 100];
const R = 50;
const W = 20;
const SPAN: [number, number] = [0, Math.PI / 2];

const PROPS = sceneProps([
  {
    center: CENTER,
    radius: R,
    angle: SPAN,
    thickness: [W, W],
    colorStart: MAGENTA,
    colorEnd: MAGENTA,
  },
]);

describe("2D ArcLayer", () => {
  const handle = use2DPage();

  it("colours the stroke inside its angle span and nothing outside it", async () => {
    await mountCycle(handle.page, "2d/arc", PROPS, async (page) => {
      for (const a of [Math.PI / 8, Math.PI / 4, (3 * Math.PI) / 8]) {
        await expectPixel(page, worldToPixel2D(polar(CENTER, R, a)), px(MAGENTA));
        // Across the stroke, 2 px inside each side.
        await expectPixel(page, worldToPixel2D(polar(CENTER, R - W / 2 + 2, a)), px(MAGENTA));
        await expectPixel(page, worldToPixel2D(polar(CENTER, R + W / 2 - 2, a)), px(MAGENTA));
        // Past the outer side of the stroke (the inner side: see the DEFECT case).
        await expectPixel(page, worldToPixel2D(polar(CENTER, R + W / 2 + 3, a)), CLEAR_PX);
      }
      // Outside the span, on the arc's circle.
      for (const a of [(5 * Math.PI) / 8, Math.PI, (3 * Math.PI) / 2, (7 * Math.PI) / 4]) {
        await expectPixel(page, worldToPixel2D(polar(CENTER, R, a)), CLEAR_PX);
      }
      await expectPixel(page, worldToPixel2D(CENTER), CLEAR_PX);
    });
  });

  // DEFECT: ArcLayer's strip has MAX_SEGMENTS * 2 + 2 vertices but its normal/interpolation tables set the last entry at index MAX_SEGMENTS * 2 + 2 instead of + 1, so the final vertex has no data and a stray triangle fills the inside of the arc between its end and its start (report DELTAV-82)
  test.failing("leaves the inside of the arc, between the stroke and the centre, clear", async () => {
    await mountCycle(handle.page, "2d/arc", PROPS, async (page) => {
      for (const a of [Math.PI / 8, Math.PI / 4, (3 * Math.PI) / 8]) {
        // 3 px past the stroke's inner side.
        await expectPixel(page, worldToPixel2D(polar(CENTER, R - W / 2 - 3, a)), CLEAR_PX);
      }
    });
  });
});
