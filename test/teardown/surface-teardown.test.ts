import { afterEach, describe, it, test } from "bun:test";

import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  rgba01To255,
  worldRectToPixel2D,
} from "../harness/probe.js";

/**
 * Teardown: every case mounts a SurfaceJSX scene three times through
 * mountCycle, probes its pixels each time, and asserts that unmounting left no
 * GL object, context, canvas, listener or frame command behind.
 *
 * Palette (0–1): channel values are multiples of 51/255, so bytes are exact,
 * and each pair differs by at least 64/255 on some channel.
 */
type RGBA01 = [number, number, number, number];
const CLEAR: RGBA01 = [0, 0, 0, 1];
const BLUE: RGBA01 = [0.2, 0.4, 1, 1];
const RED: RGBA01 = [1, 0.2, 0.2, 1];
const WHITE: RGBA01 = [1, 1, 1, 1];

const SIZE = { width: 200, height: 150 };
const CYCLES = 3;

/** The rect every rect fixture draws, in world units (= pixels, identity camera). */
const WORLD: PixelRect = { x: 20, y: 30, width: 80, height: 50 };

/** The atlas image of the resources fixture, world units. */
const IMAGE: PixelRect = { x: 30, y: 20, width: 60, height: 40 };

function rectProps(color: RGBA01) {
  return {
    ...SIZE,
    clear: CLEAR,
    position: [WORLD.x, WORLD.y],
    size: [WORLD.width, WORLD.height],
    color,
  };
}

/** The rect's colour inside it and the clear colour just outside it. */
async function probeRect(page: FixturePage, rect: PixelRect, color: RGBA01) {
  await expectRegion(page, rect, rgba01To255(color));
  await expectOutside(page, rect, rgba01To255(CLEAR));
}

/**
 * The circle the render-target fixture draws: inscribed in WORLD (centre at
 * its centre, radius half its smaller side). Probes the largest axis-aligned
 * square inside the circle, and the clear colour just outside its bounding
 * square.
 */
async function probeCircle(page: FixturePage, color: RGBA01) {
  const cx = WORLD.x + WORLD.width / 2;
  const cy = WORLD.y + WORLD.height / 2;
  const r = Math.min(WORLD.width, WORLD.height) / 2;
  const h = Math.floor(r / Math.SQRT2);
  const inside = worldRectToPixel2D({
    x: cx - h,
    y: cy - h,
    width: 2 * h,
    height: 2 * h,
  });
  const bounds = worldRectToPixel2D({
    x: cx - r,
    y: cy - r,
    width: 2 * r,
    height: 2 * r,
  });
  await expectRegion(page, inside, rgba01To255(color));
  await expectOutside(page, bounds, rgba01To255(CLEAR));
}

/**
 * Retries a probe for up to `frames` frames, for content that arrives a few
 * frames after `ready` (atlas images load asynchronously). Rethrows the last
 * failure.
 */
async function eventually(
  page: FixturePage,
  assertion: () => Promise<void>,
  frames = 60
) {
  let error: unknown;
  for (let i = 0; i < frames; ++i) {
    try {
      await assertion();
      return;
    } catch (e) {
      error = e;
      await page.evaluate(() => window.__deltav!.waitFrames(1));
    }
  }
  throw error;
}

describe("SurfaceJSX teardown", () => {
  const handle = useFixturePage();

  // A failed case must not leave its fixture or its page errors to the next.
  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("(a) releases a view and a 2D layer", async () => {
    await mountCycle(
      handle.page,
      "teardown/view-layer",
      rectProps(BLUE),
      (page) => probeRect(page, worldRectToPixel2D(WORLD), BLUE),
      { cycles: CYCLES }
    );
  });

  it("(b) releases a non-MRT colour and depth renderbuffer target", async () => {
    // A circle inscribed in WORLD is drawn into one colour renderbuffer (with
    // a depth renderbuffer), blitted into a texture of the canvas size, and
    // that texture drawn as a full-screen quad: it lands on the pixels a
    // direct draw would cover.
    await mountCycle(
      handle.page,
      "teardown/render-target",
      { ...rectProps(RED), layer: "circle" },
      (page) => probeCircle(page, RED),
      { cycles: CYCLES }
    );
  });

  // DEFECT: RectangleLayer's fragment shader writes `_FragColor` in its outline branch, so it does not compile when the layer renders into a render target (report DELTAV-74)
  test.failing(
    "(b) RectangleLayer renders into a renderbuffer target",
    async () => {
      await mountCycle(
        handle.page,
        "teardown/render-target",
        { ...rectProps(RED), layer: "rect" },
        (page) => probeRect(page, worldRectToPixel2D(WORLD), RED),
        { cycles: CYCLES }
      );
    }
  );

  /** Props of the resources fixture: the image at IMAGE, a label below it. */
  function resourceProps(source: "dataURL" | "canvas") {
    return {
      ...SIZE,
      clear: CLEAR,
      position: [IMAGE.x, IMAGE.y],
      size: [IMAGE.width, IMAGE.height],
      color: BLUE,
      // Well below the image, so the label never touches its probes.
      labelOrigin: [30, 100],
      labelColor: WHITE,
      source,
    };
  }

  it("(c) releases a texture, an atlas with an image and a font", async () => {
    await mountCycle(
      handle.page,
      "teardown/resources",
      resourceProps("dataURL"),
      (page) =>
        eventually(page, () =>
          probeRect(page, worldRectToPixel2D(IMAGE), BLUE)
        ),
      { cycles: CYCLES }
    );
  });

  // DEFECT: AtlasManager.loadImage never sets the SubTexture size for HTMLCanvasElement/ImageData/ImageBitmap sources, so they fail with "Could not load resource" (report DELTAV-75)
  test.failing(
    "(c) an atlas loads an HTMLCanvasElement image source",
    async () => {
      await mountCycle(
        handle.page,
        "teardown/resources",
        resourceProps("canvas"),
        (page) =>
          eventually(
            page,
            () => probeRect(page, worldRectToPixel2D(IMAGE), BLUE),
            20
          ),
        { cycles: CYCLES }
      );
    }
  );

  it("(d) releases a surface unmounted before its ready resolved", async () => {
    // The fixture replaces its first surface while that one is still
    // building; the second one draws the rect.
    await mountCycle(
      handle.page,
      "teardown/early-unmount",
      rectProps(BLUE),
      async (page) => {
        const canvases = await page.evaluate(
          () => document.querySelectorAll("#root canvas").length
        );
        if (canvases !== 1) {
          throw new Error(`Expected one canvas under #root, found ${canvases}`);
        }
        await probeRect(page, worldRectToPixel2D(WORLD), BLUE);
      },
      { cycles: CYCLES }
    );
  });

  it("(e) releases a surface unmounted inside its resize debounce", async () => {
    await mountCycle(
      handle.page,
      "teardown/resize-unmount",
      rectProps(RED),
      async (page) => {
        await probeRect(page, worldRectToPixel2D(WORLD), RED);
        // A resize while mounted refits to the same container: the scene
        // must still be there afterwards.
        await page.evaluate(async () => {
          window.dispatchEvent(new Event("resize"));
          await window.__deltav!.waitFrames(3);
        });
        await probeRect(page, worldRectToPixel2D(WORLD), RED);
      },
      { cycles: CYCLES }
    );
  });
});
