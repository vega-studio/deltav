import { afterEach, describe, expect, it, test } from "bun:test";

import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { worldRectToPixel2D } from "../harness/probe.js";
import { BLUE, CLEAR, eventually, expectRect, RED, spec } from "./helpers.js";

/**
 * Resize: the container of the surface changes size and a window `resize`
 * fires. The canvas must take the new size; a rect in the identity-camera
 * "screen" view must stay at its canvas pixels; a rect in the "world" view,
 * whose camera the fixture fits to scale (w / W0, h / H0), must land at
 * worldRectToPixel2D(rect, { scale }). Both follow only if deltav refits
 * every view's viewport and projection to the new canvas.
 */
const BASE = { width: 200, height: 150 };
const WORLD: PixelRect = { x: 10, y: 10, width: 40, height: 30 };
const SCREEN: PixelRect = { x: 100, y: 80, width: 40, height: 30 };

const SIZES = [
  { width: 300, height: 225 }, // ×1.5
  { width: 160, height: 120 }, // ×0.8
  { width: 400, height: 300 }, // ×2
];

/** A resize that changes the aspect ratio: ×1.5 in x, ×1 in y. */
const ANISOTROPIC = { width: 300, height: 150 };

function props(size: { width: number; height: number }) {
  return {
    ...size,
    baseWidth: BASE.width,
    baseHeight: BASE.height,
    clear: CLEAR,
    world: spec(WORLD, BLUE),
    screen: spec(SCREEN, RED),
  };
}

async function resizeTo(
  page: FixturePage,
  size: { width: number; height: number }
) {
  await page.evaluate((p) => window.__deltav!.update(p), props(size));
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
}

async function expectScene(page: FixturePage, width: number, height: number) {
  const scale: [number, number] = [width / BASE.width, height / BASE.height];
  const size = await page.evaluate(() => window.__deltav!.canvasSize());
  expect(size).toEqual({ width, height });
  await expectRect(page, worldRectToPixel2D(WORLD, { scale }), BLUE);
  await expectRect(page, SCREEN, RED);
}

describe("resize", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("fits the canvas, keeps screen-space pixels and scales world space", async () => {
    await mountCycle(
      handle.page,
      "interaction/resize",
      props(BASE),
      async (page) => {
        await expectScene(page, BASE.width, BASE.height);

        for (const size of [...SIZES, BASE]) {
          await resizeTo(page, size);
          await eventually(page, () =>
            expectScene(page, size.width, size.height)
          );
        }
      }
    );
  });

  // DEFECT: under unequal camera x/y scale, rectangle-layer.vs swaps the
  // size by cameraScale2D.yx ("assume one is filtered to be 1.0"), so a
  // ScaleMode.ALWAYS rect is drawn at size * scale.yx * scale.xy instead of
  // size * scale: 60×45 px instead of 60×30 px here. Report DELTAV-77.
  test.failing("scales a world-space rect when the aspect ratio changes", async () => {
    await mountCycle(handle.page, "interaction/resize", props(BASE), async (page) => {
      await expectScene(page, BASE.width, BASE.height);
      await resizeTo(page, ANISOTROPIC);
      await page.evaluate(() => window.__deltav!.waitFrames(10));
      await expectScene(page, ANISOTROPIC.width, ANISOTROPIC.height);
    });
  });
});
