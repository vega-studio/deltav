import { afterEach, describe, expect, it } from "bun:test";

import type { CameraState } from "../fixtures/interaction/handles.js";
import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { worldRectToPixel2D, worldToPixel2D } from "../harness/probe.js";
import { BLUE, CLEAR, eventually, expectRect, spec, waitFrames } from "./helpers.js";

/**
 * BasicCamera2DControllerJSX: a mouse drag of Δ px pans the camera so the
 * rendered rect moves by Δ px (doPan adds Δ / scale to the offset), and a
 * wheel event zooms about the cursor P: the scale becomes s · (1 − deltaY /
 * scaleFactor) (scaleFactor 1000; deltav's normalizeWheel returns
 * pixelY = −deltaY for a pixel-mode event, so wheeling up zooms in), and the
 * world point under P stays at P, so every rendered point
 * q moves to P + (q − P) · k with k the scale ratio. The rect uses
 * ScaleMode.ALWAYS so its size follows the zoom.
 */
const SIZE = { width: 300, height: 200 };
const WORLD: PixelRect = { x: 60, y: 40, width: 80, height: 60 };
const SCALE_FACTOR = 1000;

async function cameraState(page: FixturePage): Promise<CameraState> {
  return page.evaluate(() => window.__dvInteractionCamera!.camera());
}

/** `rect` scaled by k about the point p. */
function scaleAbout(rect: PixelRect, p: [number, number], k: number): PixelRect {
  return {
    x: p[0] + (rect.x - p[0]) * k,
    y: p[1] + (rect.y - p[1]) * k,
    width: rect.width * k,
    height: rect.height * k,
  };
}

describe("BasicCamera2DControllerJSX", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.mouse.up();
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  const props = { ...SIZE, clear: CLEAR, rect: spec(WORLD, BLUE) };

  it("pans the rendered scene by the drag distance", async () => {
    await mountCycle(handle.page, "interaction/camera", props, async (page) => {
      await expectRect(page, WORLD, BLUE);

      const start: [number, number] = [100, 70];
      const delta: [number, number] = [50, 30];
      await page.mouse.move(...start);
      await page.mouse.down();
      await page.mouse.move(start[0] + delta[0], start[1] + delta[1], {
        steps: 5,
      });
      await page.mouse.up();
      await waitFrames(page, 2);

      const moved = { ...WORLD, x: WORLD.x + delta[0], y: WORLD.y + delta[1] };
      await eventually(page, () => expectRect(page, moved, BLUE));
      const cam = await cameraState(page);
      expect(cam.scale).toEqual([1, 1]);
      expect(cam.offset[0]).toBeCloseTo(delta[0], 6);
      expect(cam.offset[1]).toBeCloseTo(delta[1], 6);
    });
  });

  it("zooms about the cursor, keeping the point under it fixed", async () => {
    await mountCycle(handle.page, "interaction/camera", props, async (page) => {
      await expectRect(page, WORLD, BLUE);
      const cursor: [number, number] = [80, 60];
      await page.mouse.move(...cursor);
      await waitFrames(page, 2);

      let rendered = WORLD;
      let scale = 1;
      // In (×1.5), then out (to 0.75 of that).
      for (const deltaY of [-500, 250]) {
        const before = await cameraState(page);
        // The world point under the cursor before the zoom (identity
        // offset/scale inverse of worldToPixel2D).
        const world: [number, number] = [
          cursor[0] / before.scale[0] - before.offset[0],
          cursor[1] / before.scale[1] - before.offset[1],
        ];

        await page.mouse.wheel(0, deltaY);
        await waitFrames(page, 2);

        const next = scale * (1 - deltaY / SCALE_FACTOR);
        const k = next / scale;
        scale = next;
        const after = await cameraState(page);
        expect(after.scale[0]).toBeCloseTo(scale, 9);
        expect(after.scale[1]).toBeCloseTo(scale, 9);

        // The point under the cursor stays within 1 px of it.
        const [px, py] = worldToPixel2D(world, after);
        expect(Math.abs(px - cursor[0])).toBeLessThanOrEqual(1);
        expect(Math.abs(py - cursor[1])).toBeLessThanOrEqual(1);

        // The rect is drawn scaled by k about the cursor, which is also
        // where the camera maps its world rect.
        rendered = scaleAbout(rendered, cursor, k);
        const mapped = worldRectToPixel2D(WORLD, after);
        expect(mapped.x).toBeCloseTo(rendered.x, 6);
        expect(mapped.y).toBeCloseTo(rendered.y, 6);
        await eventually(page, () => expectRect(page, rendered, BLUE));
      }
    });
  });
});
