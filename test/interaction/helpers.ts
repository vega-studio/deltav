import type { FixturePage } from "../harness/browser.js";
import type { PixelRect, RGBA255 } from "../harness/host-api.js";
import {
  expectColor,
  expectOutside,
  expectRegion,
  probe,
  rgba01To255,
} from "../harness/probe.js";

/**
 * Shared helpers of the interaction suite. Palette (0–1): channel values are
 * multiples of 51/255, so bytes are exact, and every pair (clear included)
 * differs by at least 102/255 on some channel.
 */
export type RGBA01 = [number, number, number, number];
export const CLEAR: RGBA01 = [0, 0, 0, 1];
export const BLUE: RGBA01 = [0.2, 0.4, 1, 1];
export const RED: RGBA01 = [1, 0.2, 0.2, 1];
export const GREEN: RGBA01 = [0.2, 1, 0.4, 1];
export const YELLOW: RGBA01 = [1, 1, 0.2, 1];
export const WHITE: RGBA01 = [1, 1, 1, 1];

/** A world rect spec (position, size) from a pixel rect, and back. */
export function spec(rect: PixelRect, color: RGBA01) {
  return {
    position: [rect.x, rect.y] as [number, number],
    size: [rect.width, rect.height] as [number, number],
    color,
  };
}

/** The rect's colour inside it and the clear colour just outside it. */
export async function expectRect(
  page: FixturePage,
  rect: PixelRect,
  color: RGBA01,
  clear: RGBA01 = CLEAR
) {
  await expectRegion(page, rect, rgba01To255(color));
  await expectOutside(page, rect, rgba01To255(clear));
}

/** Every grid sample inside `rect` (inset 2) has the clear colour. */
export async function expectCleared(
  page: FixturePage,
  rect: PixelRect,
  clear: RGBA01 = CLEAR
) {
  await expectRegion(page, rect, rgba01To255(clear));
}

/** Asserts a single pixel. */
export async function expectPixel(
  page: FixturePage,
  x: number,
  y: number,
  color: RGBA01 | RGBA255,
  is255 = false
) {
  const expected = is255 ? (color as RGBA255) : rgba01To255(color);
  expectColor(await probe(page, x, y), expected, void 0, { x, y });
}

export async function waitFrames(page: FixturePage, n: number) {
  await page.evaluate((n) => window.__deltav!.waitFrames(n), n);
}

/**
 * Retries an assertion once per frame for up to `frames` frames, for results
 * that arrive a few frames after the action (picking, debounced resize).
 * Rethrows the last failure.
 */
export async function eventually(
  page: FixturePage,
  assertion: () => Promise<void> | void,
  frames = 60
) {
  let error: unknown;
  for (let i = 0; i < frames; ++i) {
    try {
      await assertion();
      return;
    } catch (e) {
      error = e;
      await waitFrames(page, 1);
    }
  }
  throw error;
}

/** Index of the first pixel of `row` (RGBA bytes) matching `color` ±3. */
export function firstMatch(row: number[], color: RGBA255, from = 0): number {
  for (let x = from; x * 4 < row.length; ++x) {
    const i = x * 4;
    if (color.every((c, k) => Math.abs(row[i + k] - c) <= 3)) return x;
  }
  return -1;
}

/** Index of the last pixel of `row` matching `color` ±3. */
export function lastMatch(row: number[], color: RGBA255): number {
  for (let x = row.length / 4 - 1; x >= 0; --x) {
    const i = x * 4;
    if (color.every((c, k) => Math.abs(row[i + k] - c) <= 3)) return x;
  }
  return -1;
}
