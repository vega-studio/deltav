import { describe, expect, it } from "bun:test";

import type { FixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  rgba01To255,
  worldRectToPixel2D,
} from "../harness/probe.js";
import {
  BLUE,
  CLEAR,
  CYCLES,
  eventually,
  expectPixel,
  GREEN,
  mix255,
  ORANGE,
  pixel,
  probeRect,
  PURPLE,
  RED,
  type RGBA01,
  useResourcesPage,
  WHITE,
  YELLOW,
} from "./helpers.js";

/**
 * Textures and atlases: a TextureJSX with in-page canvas data sampled with
 * nearest and linear filtering, and an AtlasJSX packing several images for an
 * ImageLayer, with images swapped while mounted.
 */

/** Quadrant colours: top-left, top-right, bottom-left, bottom-right. */
const QUADRANTS: [RGBA01, RGBA01, RGBA01, RGBA01] = [RED, GREEN, BLUE, YELLOW];

/** The four quadrants of a square at (x, y) of side `size`, same order. */
function quadrantRects(x: number, y: number, size: number): PixelRect[] {
  const h = size / 2;
  return [
    { x, y, width: h, height: h },
    { x: x + h, y, width: h, height: h },
    { x, y: y + h, width: h, height: h },
    { x: x + h, y: y + h, width: h, height: h },
  ];
}

describe("TextureJSX filtering", () => {
  const handle = useResourcesPage();

  // A 2×2 texture (one texel per quadrant) stretched over a 200×200 canvas by
  // DrawJSX's full-screen quad: texel i covers canvas pixels [100i, 100i+100)
  // on each axis, and pixel x samples u = (x + 0.5) / 200.
  const SIZE = 200;
  const props = (filter: "nearest" | "linear") => ({
    width: SIZE,
    height: SIZE,
    clear: CLEAR,
    quadrants: QUADRANTS,
    texels: 2,
    filter,
  });

  /**
   * Each quadrant's colour inside its 100×100 canvas quarter. The quadrants
   * cover the whole canvas, so there is no clear area: the negative probes are
   * the boundary pixels, which must be exactly the colour of their own side.
   */
  async function probeQuadrants(page: FixturePage, inset: number) {
    const rects = quadrantRects(0, 0, SIZE);
    for (let i = 0; i < 4; ++i) {
      await expectRegion(page, rects[i], rgba01To255(QUADRANTS[i]), { inset });
    }
  }

  it("nearest: each quadrant is solid and a boundary pixel is exactly one of its two colours", async () => {
    await mountCycle(
      handle.page,
      "resources/texture-filter",
      props("nearest"),
      async (page) => {
        await probeQuadrants(page, 2);
        // The vertical boundary at x = 100: pixel 99 samples u = 0.4975
        // (texel 0), pixel 100 samples u = 0.5025 (texel 1). Tolerance 0.
        const [tl, tr, bl, br] = QUADRANTS.map(rgba01To255);
        await expectPixel(page, 99, 50, tl, 0);
        await expectPixel(page, 100, 50, tr, 0);
        await expectPixel(page, 99, 150, bl, 0);
        await expectPixel(page, 100, 150, br, 0);
        // The horizontal boundary at y = 100, same rule.
        await expectPixel(page, 50, 99, tl, 0);
        await expectPixel(page, 50, 100, bl, 0);
      },
      { cycles: CYCLES }
    );
  });

  it("linear: a boundary pixel is the bilinear mix of its two quadrant colours", async () => {
    await mountCycle(
      handle.page,
      "resources/texture-filter",
      props("linear"),
      async (page) => {
        // Texel centres sit at u = 0.25 and 0.75 (pixels 49.5 and 149.5), so
        // the weight of texel 1 at pixel x is t = ((x + 0.5) / 200 - 0.25) / 0.5
        // clamped to 0–1; pixels up to 49 and from 150 are solid (clamp to edge).
        const [tl, tr] = QUADRANTS.map(rgba01To255);
        const weight = (x: number) =>
          Math.min(1, Math.max(0, ((x + 0.5) / SIZE - 0.25) / 0.5));
        // Row 25 lies in the top texel row's solid band (v weight 0).
        for (const x of [10, 49, 75, 99, 100, 125, 150, 190]) {
          await expectPixel(page, x, 25, mix255(tl, tr, weight(x)));
        }
        // The boundary pixels are strictly between the two colours.
        for (const x of [99, 100]) {
          const p = await pixel(page, x, 25);
          for (const c of [0, 1]) {
            expect(p[c]).toBeGreaterThan(Math.min(tl[c], tr[c]) + 3);
            expect(p[c]).toBeLessThan(Math.max(tl[c], tr[c]) - 3);
          }
        }
      },
      { cycles: CYCLES }
    );
  });
});

describe("AtlasJSX and ImageLayer", () => {
  const handle = useResourcesPage();

  const SIZE = { width: 220, height: 160 };

  /** The 64×64 quadrant image, drawn 1:1 with its top-left at (20, 20). */
  const QUAD = {
    id: "quadrants",
    x: 20,
    y: 20,
    size: 64,
    colors: QUADRANTS,
  };
  const SOLID_WHITE = { id: "white", x: 110, y: 30, size: 32, colors: [WHITE] };
  const SOLID_PURPLE = {
    id: "purple",
    x: 160,
    y: 90,
    size: 40,
    colors: [PURPLE],
  };
  const SOLID_ORANGE = {
    id: "orange",
    x: 110,
    y: 100,
    size: 24,
    colors: [ORANGE],
  };

  type Image = { x: number; y: number; size: number; colors: RGBA01[] };

  /** World rect of an image: identity camera, so world units are pixels. */
  function imageRect(image: Image) {
    return worldRectToPixel2D({
      x: image.x,
      y: image.y,
      width: image.size,
      height: image.size,
    });
  }

  /** Each image's colours inside it, and clear around it. */
  async function probeImages(page: FixturePage, images: Image[]) {
    for (const image of images) {
      const rect = imageRect(image);
      if (image.colors.length === 4) {
        // A quadrant's neighbours are quadrants: probe each inside, and the
        // clear colour around the whole image.
        const rects = quadrantRects(rect.x, rect.y, rect.width);
        for (let i = 0; i < 4; ++i) {
          await expectRegion(page, rects[i], rgba01To255(image.colors[i]));
        }
        await expectOutside(page, rect, rgba01To255(CLEAR));
      } else {
        await probeRect(page, rect, image.colors[0]);
      }
    }
  }

  it("an ImageLayer image sampling a quadrant texture shows each quadrant at its pixels", async () => {
    await mountCycle(
      handle.page,
      "resources/atlas-images",
      { ...SIZE, clear: CLEAR, images: [QUAD] },
      (page) => eventually(page, () => probeImages(page, [QUAD])),
      { cycles: CYCLES }
    );
  });

  it("packs several images into one atlas, each at its own position", async () => {
    const images = [QUAD, SOLID_WHITE, SOLID_PURPLE];
    await mountCycle(
      handle.page,
      "resources/atlas-images",
      { ...SIZE, clear: CLEAR, images },
      (page) => eventually(page, () => probeImages(page, images)),
      { cycles: CYCLES }
    );
  });

  it("removes one image and adds another while mounted", async () => {
    const before = [QUAD, SOLID_WHITE, SOLID_PURPLE];
    const after = [QUAD, SOLID_PURPLE, SOLID_ORANGE];
    await mountCycle(
      handle.page,
      "resources/atlas-images",
      { ...SIZE, clear: CLEAR, images: before },
      async (page) => {
        await eventually(page, () => probeImages(page, before));
        await page.evaluate((p) => window.__deltav!.update(p), {
          ...SIZE,
          clear: CLEAR,
          images: after,
        });
        await eventually(page, async () => {
          await probeImages(page, after);
          // The removed image's area is clear again.
          await probeRect(page, imageRect(SOLID_WHITE), CLEAR);
        });
      },
      { cycles: CYCLES }
    );
  });
});
