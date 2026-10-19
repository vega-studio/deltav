import { describe, it, test } from "bun:test";

import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  worldRectToPixel2D,
} from "../harness/probe.js";
import { BLUE, CANVAS, CLEAR, RED, type RGBA01 } from "./palette.js";
import { CLEAR_PX, px, update, use2DPage } from "./util.js";

/**
 * Changing the LayerJSX children of a mounted SurfaceJSX: a removed layer's
 * pixels go back to the clear colour, an added layer's pixels appear.
 */
const A: PixelRect = { x: 20, y: 20, width: 60, height: 60 };
const B: PixelRect = { x: 120, y: 110, width: 60, height: 60 };

function layer(name: string, r: PixelRect, color: RGBA01) {
  return { name, instances: [{ position: [r.x, r.y], size: [r.width, r.height], color }] };
}

function props(layers: unknown[]) {
  return { ...CANVAS, clear: CLEAR, layers };
}

const LAYER_A = layer("a", A, RED);
const LAYER_B = layer("b", B, BLUE);

describe("2D LayerJSX add and remove", () => {
  const handle = use2DPage();

  it("removes a layer's pixels when its LayerJSX is removed", async () => {
    await mountCycle(handle.page, "2d/rectangle", props([LAYER_A, LAYER_B]), async (page) => {
      await expectRegion(page, worldRectToPixel2D(A), px(RED));
      await expectRegion(page, worldRectToPixel2D(B), px(BLUE));
      await update(page, props([LAYER_A]));
      await expectRegion(page, worldRectToPixel2D(A), px(RED));
      await expectRegion(page, worldRectToPixel2D(B), CLEAR_PX, { inset: 0 });
      await expectOutside(page, worldRectToPixel2D(A), CLEAR_PX);
    });
  });

  // DEFECT: SurfaceJSX fixes its pipeline at mount, so a LayerJSX added to a mounted surface gets a resolver but is never added to the scene and never draws (report DELTAV-83)
  test.failing("adds a layer's pixels when a LayerJSX is added", async () => {
    await mountCycle(handle.page, "2d/rectangle", props([LAYER_A]), async (page) => {
      await expectRegion(page, worldRectToPixel2D(B), CLEAR_PX, { inset: 0 });
      await update(page, props([LAYER_A, LAYER_B]));
      await expectRegion(page, worldRectToPixel2D(A), px(RED));
      await expectRegion(page, worldRectToPixel2D(B), px(BLUE));
    });
  });
});
