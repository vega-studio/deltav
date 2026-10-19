import { afterEach, describe, expect, it } from "@jest/globals";

import { useFixturePage } from "./browser.js";
import type { PixelRect, RGBA255 } from "./host-api.js";
import {
  expectColor,
  expectOutside,
  expectRegion,
  probe,
  rgba01To255,
  worldRectToPixel2D,
  worldToPixel2D,
} from "./probe.js";

/**
 * Methodology controls: prove that the probes read the pixels a scene really
 * wrote, in the right orientation, and that they can fail.
 *
 * Palette (0–1): every colour is a multiple of 1/255 * 51 so its byte value is
 * exact, and each pair differs by at least 64/255 on some channel.
 */
const CLEAR: [number, number, number, number] = [0, 0, 0, 1];
const RED: [number, number, number, number] = [1, 0.2, 0.2, 1];
const BLUE: [number, number, number, number] = [0.2, 0.4, 1, 1];

const SIZE = { width: 400, height: 300 };

describe("probe harness controls", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    expect(handle.page.errors).toEqual([]);
    handle.page.errors.length = 0;
  });

  it("reads exactly the pixels plain WebGL2 wrote (orientation control)", async () => {
    const { page } = handle;
    // A rect near the top-left and away from the centre, so a vertically
    // flipped readback would land on the clear colour.
    const rect: PixelRect = { x: 40, y: 30, width: 120, height: 60 };
    await page.evaluate(
      (props) => window.__deltav!.mount("control/raw-webgl", props),
      { ...SIZE, clear: CLEAR, rect, fill: RED }
    );

    expect(await page.evaluate(() => window.__deltav!.canvasSize())).toEqual(
      SIZE
    );

    const red = rgba01To255(RED);
    const clear = rgba01To255(CLEAR);

    // Scissor clears are exact: no tolerance, no inset.
    await expectRegion(page, rect, red, { inset: 0, tol: 0, steps: 7 });
    await expectOutside(page, rect, clear, { margin: 0, tol: 0 });

    // Exact corners: first pixel inside and first pixel outside each edge.
    expectColor(await probe(page, 40, 30), red, 0);
    expectColor(await probe(page, 159, 89), red, 0);
    expectColor(await probe(page, 39, 30), clear, 0);
    expectColor(await probe(page, 40, 29), clear, 0);
    expectColor(await probe(page, 160, 89), clear, 0);
    expectColor(await probe(page, 159, 90), clear, 0);

    // The vertically mirrored position of the rect must be clear.
    expectColor(await probe(page, 100, SIZE.height - 60), clear, 0);
  });

  it("renders a deltav RectangleLayer instance where worldToPixel2D puts it", async () => {
    const { page } = handle;
    const world: PixelRect = { x: 50, y: 40, width: 100, height: 80 };
    await page.evaluate(
      (props) => window.__deltav!.mount("control/rect", props),
      {
        ...SIZE,
        clear: CLEAR,
        position: [world.x, world.y],
        size: [world.width, world.height],
        color: BLUE,
      }
    );

    const pixels = worldRectToPixel2D(world);
    expect(pixels).toEqual({ x: 50, y: 40, width: 100, height: 80 });
    expect(worldToPixel2D([world.x, world.y])).toEqual([50, 40]);

    await expectRegion(page, pixels, rgba01To255(BLUE));
    await expectOutside(page, pixels, rgba01To255(CLEAR));
  });

  it("fails against a deliberately wrong expectation", async () => {
    const { page } = handle;
    const rect: PixelRect = { x: 20, y: 20, width: 50, height: 50 };
    await page.evaluate(
      (props) => window.__deltav!.mount("control/raw-webgl", props),
      { ...SIZE, clear: CLEAR, rect, fill: RED }
    );

    const actual = await probe(page, 40, 40);
    // Correct expectation passes...
    expectColor(actual, rgba01To255(RED));
    // ...a wrong colour must throw, and so must an off-by-more-than-tol one.
    expect(() => expectColor(actual, rgba01To255(BLUE))).toThrow(
      /at|expected/
    );
    const nearMiss = rgba01To255(RED).map((v, i) =>
      i === 1 ? v + 4 : v
    ) as RGBA255;
    expect(() => expectColor(actual, nearMiss)).toThrow(/delta/);
    // The async probes reject on a wrong expectation too.
    await expect(
      expectRegion(page, rect, rgba01To255(BLUE))
    ).rejects.toThrow(/expected/);
    await expect(
      expectOutside(page, rect, rgba01To255(RED))
    ).rejects.toThrow(/expected/);
  });
});
