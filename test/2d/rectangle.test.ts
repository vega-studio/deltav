import { describe, it } from "@jest/globals";

import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  worldRectToPixel2D,
} from "../harness/probe.js";
import { BLUE, CANVAS, CLEAR, GREEN, RED, type RGBA01 } from "./palette.js";
import { blendOver, CLEAR_PX, px, sceneProps, update, use2DPage } from "./util.js";

/**
 * RectangleLayer: rectangles anchored top-left, identity Camera2D, so a world
 * rect is the canvas pixel rect worldRectToPixel2D gives.
 */
function rect(r: PixelRect, color: RGBA01) {
  return { position: [r.x, r.y], size: [r.width, r.height], color };
}

/** Two overlapping world rects and their overlap and exclusive parts. */
const A: PixelRect = { x: 20, y: 20, width: 100, height: 100 };
const B: PixelRect = { x: 60, y: 60, width: 100, height: 100 };
const OVERLAP: PixelRect = { x: 60, y: 60, width: 60, height: 60 };
/** Parts of A and of B that the other does not cover. */
const ONLY_A: PixelRect = { x: 20, y: 20, width: 100, height: 40 };
const ONLY_B: PixelRect = { x: 120, y: 60, width: 40, height: 100 };

describe("2D RectangleLayer", () => {
  const handle = use2DPage();

  it("covers its position and size, and nothing around it", async () => {
    const world: PixelRect = { x: 40, y: 30, width: 100, height: 60 };
    await mountCycle(handle.page, "2d/rectangle", sceneProps([rect(world, BLUE)]), async (page) => {
      const pixels = worldRectToPixel2D(world);
      // The 5×5 grid of expectRegion includes the four inside corners (2 px
      // in) and the centre.
      await expectRegion(page, pixels, px(BLUE));
      await expectOutside(page, pixels, CLEAR_PX);
    });
  });

  it("draws later instances of one layer over earlier ones", async () => {
    await mountCycle(
      handle.page,
      "2d/rectangle",
      sceneProps([rect(A, RED), rect(B, BLUE)]),
      async (page) => {
        await expectRegion(page, worldRectToPixel2D(OVERLAP), px(BLUE));
        await expectRegion(page, worldRectToPixel2D(ONLY_A), px(RED));
        await expectRegion(page, worldRectToPixel2D(ONLY_B), px(BLUE));
        await expectOutside(page, worldRectToPixel2D({ x: 20, y: 20, width: 140, height: 140 }), CLEAR_PX);
      }
    );
  });

  for (const order of [
    ["first", "second"],
    ["second", "first"],
  ] as const) {
    it(`draws later layers over earlier ones (${order.join(", ")})`, async () => {
      const specs = {
        first: { name: "first", instances: [rect(A, RED)] },
        second: { name: "second", instances: [rect(B, BLUE)] },
      };
      const top = order[1] === "first" ? RED : BLUE;
      await mountCycle(
        handle.page,
        "2d/rectangle",
        { ...CANVAS, clear: CLEAR, layers: order.map((n) => specs[n]) },
        async (page) => {
          await expectRegion(page, worldRectToPixel2D(OVERLAP), px(top));
          await expectRegion(page, worldRectToPixel2D(ONLY_A), px(RED));
          await expectRegion(page, worldRectToPixel2D(ONLY_B), px(BLUE));
        }
      );
    });
  }

  it("alpha-blends a translucent rectangle as src·a + dst·(1−a)", async () => {
    // 0.6 = 153/255: a byte-exact alpha.
    const translucent: RGBA01 = [BLUE[0], BLUE[1], BLUE[2], 0.6];
    await mountCycle(
      handle.page,
      "2d/rectangle",
      {
        ...CANVAS,
        clear: CLEAR,
        layers: [
          { name: "under", instances: [rect(A, RED)] },
          { name: "over", instances: [rect(B, translucent)] },
        ],
      },
      async (page) => {
        await expectRegion(page, worldRectToPixel2D(OVERLAP), blendOver(translucent, RED));
        await expectRegion(page, worldRectToPixel2D(ONLY_B), blendOver(translucent, CLEAR));
        await expectRegion(page, worldRectToPixel2D(ONLY_A), px(RED));
      }
    );
  });

  it("re-renders an instance whose colour is mutated", async () => {
    const world: PixelRect = { x: 50, y: 50, width: 80, height: 80 };
    const props = sceneProps([rect(world, BLUE)]);
    await mountCycle(handle.page, "2d/rectangle", props, async (page) => {
      const pixels = worldRectToPixel2D(world);
      await expectRegion(page, pixels, px(BLUE));
      await update(page, sceneProps([rect(world, GREEN)]));
      await expectRegion(page, pixels, px(GREEN));
      await expectOutside(page, pixels, CLEAR_PX);
    });
  });
});
