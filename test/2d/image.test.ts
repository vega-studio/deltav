import { describe, it } from "bun:test";

import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  worldRectToPixel2D,
} from "../harness/probe.js";
import { BLUE, GREEN, RED, YELLOW } from "./palette.js";
import { CLEAR_PX, eventually, px, sceneProps, use2DPage } from "./util.js";

/**
 * ImageLayer: an image anchored top-left at `origin` with `width`×`height`
 * covers that world rect, with the source's top-left texel at its top-left.
 * The source is a 32×32 canvas of four solid quadrants, so each quadrant of
 * the drawn rect has one colour. Linear filtering blends texels across the
 * seams (one texel is 120/32 = 3.75 px), so quadrant probes stay 6 px away
 * from the seams and the outer edge.
 */
const WORLD: PixelRect = { x: 40, y: 40, width: 120, height: 120 };
const QUADRANTS = [RED, GREEN, BLUE, YELLOW] as const;

function quadrant(i: number): PixelRect {
  const w = WORLD.width / 2;
  const h = WORLD.height / 2;
  return { x: WORLD.x + (i % 2) * w, y: WORLD.y + Math.floor(i / 2) * h, width: w, height: h };
}

describe("2D ImageLayer", () => {
  const handle = use2DPage();

  it("draws its source's quadrants at their analytic positions", async () => {
    const props = sceneProps([
      {
        origin: [WORLD.x, WORLD.y],
        width: WORLD.width,
        height: WORLD.height,
        quadrants: QUADRANTS,
      },
    ]);
    await mountCycle(handle.page, "2d/image", props, (page) =>
      // The atlas loads the image asynchronously after the surface is ready.
      eventually(page, async () => {
        for (let i = 0; i < 4; ++i) {
          await expectRegion(page, worldRectToPixel2D(quadrant(i)), px(QUADRANTS[i]), { inset: 6 });
        }
        await expectOutside(page, worldRectToPixel2D(WORLD), CLEAR_PX);
      })
    );
  });
});
