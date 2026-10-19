import { describe, it } from "@jest/globals";

import type { FixturePage } from "../harness/browser.js";
import type { PixelRect, RGBA255 } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  type Camera2DState,
  expectOutside,
  expectRegion,
  worldRectToPixel2D,
} from "../harness/probe.js";
import { BLUE, CANVAS, CLEAR, GREEN, RED, type RGBA01 } from "./palette.js";
import { CLEAR_PX, px, use2DPage } from "./util.js";

/**
 * View2D and Camera2D: a world point p lands on canvas pixel
 * viewOrigin + (p + offset) · scale (worldToPixel2D), and nothing is drawn
 * outside the view's viewport.
 */
function rect(r: PixelRect, color: RGBA01) {
  return { position: [r.x, r.y], size: [r.width, r.height], color };
}

function props(views: unknown[], instances: unknown[]) {
  return { ...CANVAS, clear: CLEAR, views, layers: [{ name: "a", instances }] };
}

/**
 * Pixels no view covers keep the drawing buffer's initial value, transparent
 * black: WebGL starts every buffer at (0, 0, 0, 0) and only views clear.
 */
const UNTOUCHED: RGBA255 = [0, 0, 0, 0];

async function probeRect(page: FixturePage, world: PixelRect, color: RGBA01, camera: Camera2DState) {
  const pixels = worldRectToPixel2D(world, camera);
  await expectRegion(page, pixels, px(color));
  await expectOutside(page, pixels, CLEAR_PX);
}

describe("2D View2D and Camera2D", () => {
  const handle = use2DPage();

  it("clips drawing to the view's viewport, whose top-left is the world origin", async () => {
    const viewport = { left: 50, top: 40, width: 100, height: 120 };
    const camera: Camera2DState = { viewOrigin: [viewport.left, viewport.top] };
    // A rect much larger than the viewport, and a small one inside it.
    const big: PixelRect = { x: -60, y: -60, width: 300, height: 300 };
    const small: PixelRect = { x: 10, y: 10, width: 30, height: 30 };
    await mountCycle(
      handle.page,
      "2d/view",
      props([{ name: "clip", viewport }], [rect(big, RED), rect(small, BLUE)]),
      async (page) => {
        const vp: PixelRect = { x: viewport.left, y: viewport.top, width: viewport.width, height: viewport.height };
        await expectRegion(page, worldRectToPixel2D(small, camera), px(BLUE));
        await expectRegion(page, { x: vp.x, y: vp.y + 60, width: vp.width, height: 60 }, px(RED));
        await expectOutside(page, vp, UNTOUCHED, { margin: 1 });
      }
    );
  });

  it("shifts the scene by the camera offset", async () => {
    const world: PixelRect = { x: 40, y: 60, width: 60, height: 50 };
    const camera: Camera2DState = { offset: [25, -15] };
    await mountCycle(
      handle.page,
      "2d/view",
      props([{ name: "main", offset: camera.offset }], [rect(world, BLUE)]),
      async (page) => {
        await probeRect(page, world, BLUE, camera);
        // Where the rect would be without the offset, outside its shifted copy.
        await expectRegion(page, { x: 40, y: 95, width: 25, height: 15 }, CLEAR_PX, { inset: 3 });
      }
    );
  });

  it("scales the scene by the camera scale", async () => {
    const world: PixelRect = { x: 20, y: 30, width: 40, height: 30 };
    const camera: Camera2DState = { scale: [2, 2] };
    await mountCycle(
      handle.page,
      "2d/view",
      props([{ name: "main", scale: camera.scale }], [rect(world, GREEN)]),
      (page) => probeRect(page, world, GREEN, camera)
    );
  });

  it("combines camera offset and scale as (world + offset) · scale", async () => {
    const world: PixelRect = { x: 30, y: 20, width: 30, height: 40 };
    const camera: Camera2DState = { offset: [10, 15], scale: [1.5, 1.5] };
    await mountCycle(
      handle.page,
      "2d/view",
      props([{ name: "main", offset: camera.offset, scale: camera.scale }], [rect(world, RED)]),
      (page) => probeRect(page, world, RED, camera)
    );
  });

  it("renders one scene in two views side by side", async () => {
    const world: PixelRect = { x: 20, y: 30, width: 50, height: 60 };
    const left = { left: 0, top: 0, width: 100, height: 200 };
    const right = { left: 100, top: 0, width: 100, height: 200 };
    await mountCycle(
      handle.page,
      "2d/view",
      props(
        [
          { name: "left", viewport: left },
          { name: "right", viewport: right },
        ],
        [rect(world, GREEN)]
      ),
      async (page) => {
        await probeRect(page, world, GREEN, { viewOrigin: [0, 0] });
        await probeRect(page, world, GREEN, { viewOrigin: [100, 0] });
      }
    );
  });
});
