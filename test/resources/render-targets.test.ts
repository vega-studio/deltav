import { describe, it } from "bun:test";

import type { FixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  rgba01To255,
  worldToPixel2D,
} from "../harness/probe.js";
import {
  BLUE,
  CLEAR,
  type ColorRect,
  CYCLES,
  GREEN,
  probeRect,
  RED,
  type RGBA01,
  useResourcesPage,
  YELLOW,
} from "./helpers.js";

/**
 * Render targets: a ColorBufferJSX drawn to the screen, depth resolution
 * through a DepthBufferJSX, a FloatTextureJSX holding values outside 0–1, and
 * one pass writing two outputs (MRT).
 */

const SIZE = { width: 200, height: 150 };

interface Circle {
  center: [number, number];
  radius: number;
  color: RGBA01;
  depth: number;
}

/**
 * The largest axis-aligned square inside a circle and the circle's bounding
 * square, in canvas pixels, for a View2D camera offset by `offset`.
 */
function circleRects(circle: Circle, offset: [number, number]) {
  const [cx, cy] = worldToPixel2D(circle.center, { offset });
  const r = circle.radius;
  const h = Math.floor(r / Math.SQRT2);
  const inside: PixelRect = {
    x: cx - h,
    y: cy - h,
    width: 2 * h,
    height: 2 * h,
  };
  const bounds: PixelRect = {
    x: cx - r,
    y: cy - r,
    width: 2 * r,
    height: 2 * r,
  };
  return { inside, bounds };
}

describe("ColorBufferJSX to the screen", () => {
  const handle = useResourcesPage();

  it("draws a two-circle scene rendered into a colour buffer at the scene's own pixels", async () => {
    // Two circles, an offset camera: world (x, y) lands on canvas pixel
    // (x + 15, y - 10). Rendered into an RGBA8 colour renderbuffer, blitted to
    // a texture and drawn by DrawJSX as a full-screen quad, every pixel must be
    // where a direct draw would put it.
    const offset: [number, number] = [15, -10];
    const circles: Circle[] = [
      { center: [40, 70], radius: 25, color: RED, depth: 0 },
      { center: [120, 95], radius: 30, color: GREEN, depth: 0 },
    ];
    await mountCycle(
      handle.page,
      "resources/circle-target",
      { ...SIZE, clear: CLEAR, offset, depth: false, circles },
      async (page) => {
        for (const circle of circles) {
          const { inside, bounds } = circleRects(circle, offset);
          await expectRegion(page, inside, rgba01To255(circle.color));
          await expectOutside(page, bounds, rgba01To255(CLEAR));
        }
      },
      { cycles: CYCLES }
    );
  });
});

describe("DepthBufferJSX", () => {
  const handle = useResourcesPage();

  // View2D projects depth orthographically with near -100 and far 1e7 (see
  // docs/2d/view-and-camera.md), so NDC z = (-100 - depth) / (1e7 + 100):
  // a larger CircleInstance depth is nearer the camera. A DEPTH_COMPONENT16
  // buffer resolves steps of 1e7 / 2^15 ≈ 305 depth units, so the two circles
  // sit 100000 apart. The near circle's layer draws FIRST, so painter's order
  // alone would put the far circle on top.
  const NEAR: Circle = {
    center: [70, 75],
    radius: 40,
    color: RED,
    depth: 100000,
  };
  const FAR: Circle = { center: [130, 75], radius: 40, color: BLUE, depth: 0 };

  /**
   * The lens both circles cover: x 92–108 lies within 40 px of both centres
   * for |y - 75| <= 6 (the farthest corner is sqrt(38² + 6²) ≈ 38.5 away).
   */
  const OVERLAP: PixelRect = { x: 92, y: 69, width: 16, height: 12 };
  /** Parts only one circle covers, away from the other's quad. */
  const NEAR_ONLY: PixelRect = { x: 40, y: 65, width: 40, height: 20 };
  const FAR_ONLY: PixelRect = { x: 120, y: 65, width: 40, height: 20 };

  async function probeScene(page: FixturePage, overlap: RGBA01) {
    await expectRegion(page, NEAR_ONLY, rgba01To255(NEAR.color));
    await expectRegion(page, FAR_ONLY, rgba01To255(FAR.color));
    await expectRegion(page, OVERLAP, rgba01To255(overlap));
    // Clear above and below the pair and beyond their outer sides.
    await expectOutside(
      page,
      { x: 30, y: 35, width: 140, height: 80 },
      rgba01To255(CLEAR)
    );
  }

  it("resolves the overlap to the nearer circle, drawn first", async () => {
    await mountCycle(
      handle.page,
      "resources/circle-target",
      {
        ...SIZE,
        clear: CLEAR,
        offset: [0, 0],
        depth: true,
        circles: [NEAR, FAR],
      },
      (page) => probeScene(page, NEAR.color),
      { cycles: CYCLES }
    );
  });

  it("control: without the depth buffer the circle drawn last covers the overlap", async () => {
    await mountCycle(
      handle.page,
      "resources/circle-target",
      {
        ...SIZE,
        clear: CLEAR,
        offset: [0, 0],
        depth: false,
        circles: [NEAR, FAR],
      },
      (page) => probeScene(page, FAR.color),
      { cycles: CYCLES }
    );
  });
});

describe("FloatTextureJSX", () => {
  const handle = useResourcesPage();

  it("keeps values outside 0–1 and reads them back through an affine map", async () => {
    // The write pass stores (-2, 3, 2) inside RECT and -4 elsewhere in an
    // RGBA32F texture; the read pass draws (v + 4) / 8. Inside: (0.25, 0.875,
    // 0.75); outside: 0 = the clear colour. An 8-bit target would have clamped
    // the values to 0–1 and given (0.5, 0.625, 0.625).
    const RECT: PixelRect = { x: 20, y: 30, width: 80, height: 50 };
    const VALUES: RGBA01 = [-2, 3, 2, 1];
    const OFFSET = 4;
    const SCALE = 1 / 8;
    const mapped: RGBA01 = [
      (VALUES[0] + OFFSET) * SCALE,
      (VALUES[1] + OFFSET) * SCALE,
      (VALUES[2] + OFFSET) * SCALE,
      1,
    ];
    await mountCycle(
      handle.page,
      "resources/float-texture",
      {
        ...SIZE,
        clear: CLEAR,
        rects: [{ ...RECT, color: VALUES }],
        background: [-OFFSET, -OFFSET, -OFFSET, 1],
        offset: OFFSET,
        scale: SCALE,
      },
      (page) => probeRect(page, RECT, mapped),
      { cycles: CYCLES }
    );
  });
});

describe("Multiple render targets", () => {
  const handle = useResourcesPage();

  it("one pass writes two outputs, each drawn to its own screen half", async () => {
    // COLOR → texture "first", GLOW → texture "second", both 200×150. Each is
    // drawn into a 100×150 half of the canvas, so texture pixel (x, y) lands
    // on (x / 2, y) on the left and (100 + x / 2, y) on the right.
    const first: ColorRect = {
      x: 20,
      y: 20,
      width: 60,
      height: 40,
      color: YELLOW,
    };
    const second: ColorRect = {
      x: 120,
      y: 80,
      width: 60,
      height: 50,
      color: BLUE,
    };
    const left = (r: ColorRect): PixelRect => ({
      x: r.x / 2,
      y: r.y,
      width: r.width / 2,
      height: r.height,
    });
    const right = (r: ColorRect): PixelRect => ({
      x: SIZE.width / 2 + r.x / 2,
      y: r.y,
      width: r.width / 2,
      height: r.height,
    });
    await mountCycle(
      handle.page,
      "resources/mrt",
      { ...SIZE, clear: CLEAR, first: [first], second: [second] },
      async (page) => {
        await probeRect(page, left(first), first.color);
        await probeRect(page, right(second), second.color);
        // Each output holds only its own rect: where the other output's rect
        // would land in each half is clear.
        await expectRegion(page, left(second), rgba01To255(CLEAR));
        await expectRegion(page, right(first), rgba01To255(CLEAR));
      },
      { cycles: CYCLES }
    );
  });
});
