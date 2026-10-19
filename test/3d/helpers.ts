import { expect } from "bun:test";

import type { FixturePage } from "../harness/browser.js";
import type { RGBA255 } from "../harness/host-api.js";
import {
  expectColor,
  expectOutside,
  expectRegion,
  probe,
  rgba01To255,
} from "../harness/probe.js";
import type { RGBA01 } from "../fixtures/3d/scene-props.js";
import { type PixelBox, toRect } from "./expect-math.js";

/**
 * Palette of the 3D suite (0–1). Channels are multiples of 51/255 or 0/1 so
 * the bytes are exact; every pair differs by at least 64/255 on some channel.
 * RED is what the built-in CubeLayer and TriangleLayer always paint
 * (vec4(1, 0, 0, 1), docs/3d/layers.md), so no 3D colour may be close to it
 * except where it is that layer's output.
 */
export const CLEAR: RGBA01 = [0, 0, 0, 1];
export const RED: RGBA01 = [1, 0, 0, 1];
export const BLUE: RGBA01 = [0.2, 0.4, 1, 1];
export const GREEN: RGBA01 = [0.2, 1, 0.4, 1];
export const YELLOW: RGBA01 = [1, 1, 0.2, 1];

/** Canvas size of every 3D fixture. */
export const SIZE = { width: 200, height: 200 };
export const VP = SIZE;

/** Base fixture props: size and clear colour. */
export const BASE = { ...SIZE, clear: CLEAR };

export const clear255 = (): RGBA255 => rgba01To255(CLEAR);

/**
 * A shape covers `inner` with `color` (probed 2 px inside) and leaves the
 * clear colour 2 px outside `outer`, its whole projected silhouette.
 */
export async function expectShape(
  page: FixturePage,
  inner: PixelBox,
  outer: PixelBox,
  color: RGBA01
) {
  await expectRegion(page, toRect(inner), rgba01To255(color));
  await expectOutside(page, toRect(outer), clear255());
}

/** The canvas is the clear colour everywhere on a 9×9 grid. */
export async function expectAllClear(page: FixturePage) {
  await expectRegion(
    page,
    { x: 0, y: 0, ...SIZE },
    clear255(),
    { inset: 1, steps: 9 }
  );
}

/** A single pixel has `color`. */
export async function expectPixel(
  page: FixturePage,
  x: number,
  y: number,
  color: RGBA01
) {
  const px = Math.floor(x);
  const py = Math.floor(y);
  expectColor(await probe(page, px, py), rgba01To255(color), void 0, {
    x: px,
    y: py,
  });
}

/** Re-renders the mounted fixture with new props. */
export async function update(page: FixturePage, props: object) {
  await page.evaluate((p) => window.__deltav!.update(p as any), props);
}

/**
 * Retries a probe for up to `frames` frames: transform changes reach the GPU
 * through the scene graph's per-frame update queue, so a moved instance can
 * take a frame or two after `update` to land. Rethrows the last failure.
 */
export async function eventually(
  page: FixturePage,
  assertion: () => Promise<void>,
  frames = 10
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

/** Two pixel boxes are equal to 6 decimals (the oracle works in floats). */
export function expectBox(actual: PixelBox, expected: PixelBox) {
  expect(actual.left).toBeCloseTo(expected.left, 6);
  expect(actual.top).toBeCloseTo(expected.top, 6);
  expect(actual.right).toBeCloseTo(expected.right, 6);
  expect(actual.bottom).toBeCloseTo(expected.bottom, 6);
}

type P2 = { x: number; y: number };

/**
 * A triangle with projected vertices `v` (pixels) is drawn in `color`: a
 * 9×9 block around its centroid and a point 30 % of the way from each
 * vertex to the centroid are inside; a point 3 px beyond the middle of each
 * edge, and 3 px beyond each vertex, are the clear colour.
 */
export async function expectTriangle(
  page: FixturePage,
  v: [P2, P2, P2],
  color: RGBA01
) {
  const g = {
    x: (v[0].x + v[1].x + v[2].x) / 3,
    y: (v[0].y + v[1].y + v[2].y) / 3,
  };
  await expectRegion(
    page,
    { x: g.x - 4.5, y: g.y - 4.5, width: 9, height: 9 },
    rgba01To255(color),
    { inset: 0, steps: 3 }
  );

  for (const p of v) {
    await expectPixel(page, p.x + 0.3 * (g.x - p.x), p.y + 0.3 * (g.y - p.y), color);
    // Beyond the vertex, away from the centroid.
    const d = Math.hypot(p.x - g.x, p.y - g.y);
    await expectPixel(
      page,
      p.x + ((p.x - g.x) / d) * 3,
      p.y + ((p.y - g.y) / d) * 3,
      CLEAR
    );
  }

  for (let i = 0; i < 3; ++i) {
    const a = v[i];
    const b = v[(i + 1) % 3];
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    // Edge normal, flipped to point away from the centroid.
    let nx = -(b.y - a.y);
    let ny = b.x - a.x;
    const len = Math.hypot(nx, ny);
    nx /= len;
    ny /= len;
    if (nx * (g.x - m.x) + ny * (g.y - m.y) > 0) {
      nx = -nx;
      ny = -ny;
    }
    await expectPixel(page, m.x + nx * 3, m.y + ny * 3, CLEAR);
  }
}
