import { afterEach } from "bun:test";

import {
  type FixturePage,
  type FixturePageHandle,
  useFixturePage,
} from "../harness/browser.js";
import type { PixelRect, RGBA255 } from "../harness/host-api.js";
import {
  expectColor,
  expectOutside,
  expectRegion,
  pixelAt,
  readPixels,
  rgba01To255,
} from "../harness/probe.js";

/**
 * Shared pieces of the resources suite (test/resources/*.test.ts).
 *
 * Palette (0–1): channel values are multiples of 51/255, so bytes are exact,
 * and each pair differs by at least 64/255 on some channel and from CLEAR.
 */
export type RGBA01 = [number, number, number, number];

export const CLEAR: RGBA01 = [0, 0, 0, 1];
export const RED: RGBA01 = [1, 0.2, 0.2, 1];
export const GREEN: RGBA01 = [0.2, 1, 0.2, 1];
export const BLUE: RGBA01 = [0.2, 0.4, 1, 1];
export const YELLOW: RGBA01 = [1, 1, 0.2, 1];
export const WHITE: RGBA01 = [1, 1, 1, 1];
export const PURPLE: RGBA01 = [0.6, 0.2, 1, 1];
export const ORANGE: RGBA01 = [1, 0.6, 0.2, 1];

/** Breakdown-and-rebuild rounds of every case (D6). */
export const CYCLES = 2;

/** A rect with its fill colour, as the resources fixtures take it. */
export interface ColorRect extends PixelRect {
  color: RGBA01;
}

/**
 * One fixture page per test file; after each case the fixture is unmounted
 * and the page errors are cleared, so a failed case cannot leak into the
 * next.
 */
export function useResourcesPage(): FixturePageHandle {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  return handle;
}

/** The rect's colour inside it and `clear` just outside it. */
export async function probeRect(
  page: FixturePage,
  rect: PixelRect,
  color: RGBA01,
  clear: RGBA01 = CLEAR,
  opts: { inset?: number; margin?: number } = {}
) {
  await expectRegion(page, rect, rgba01To255(color), { inset: opts.inset });
  await expectOutside(page, rect, rgba01To255(clear), { margin: opts.margin });
}

/**
 * Retries a probe for up to `frames` frames, for content that arrives a few
 * frames after `ready` (atlas images and font glyphs load asynchronously).
 * Rethrows the last failure.
 */
export async function eventually(
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

/** One canvas pixel as 0–255 bytes. */
export async function pixel(page: FixturePage, x: number, y: number) {
  const block = await readPixels(page, { x, y, width: 1, height: 1 });
  return pixelAt(block, 0, 0);
}

/** `expectColor` on one canvas pixel, naming it in the error. */
export async function expectPixel(
  page: FixturePage,
  x: number,
  y: number,
  expected: RGBA255,
  tol?: number
) {
  expectColor(await pixel(page, x, y), expected, tol, { x, y });
}

/** Mean of the RGB bytes of a pixel. */
export function brightness(p: RGBA255) {
  return (p[0] + p[1] + p[2]) / 3;
}

/** Linear interpolation of two 0–255 colours. */
export function mix255(a: RGBA255, b: RGBA255, t: number): RGBA255 {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGBA255;
}
