import type { FixturePage } from "../harness/browser.js";
import type { PixelRect, RGBA255 } from "../harness/host-api.js";
import {
  DEFAULT_INSET,
  expectColor,
  pixelAt,
  rgba01To255,
  worldRectToPixel2D,
} from "../harness/probe.js";

/**
 * Probes and palette shared by the stress scenarios. Every expectation is
 * computed from the geometry the test hands the fixture (identity Camera2D:
 * world units are canvas pixels).
 *
 * Palette (0–1): channel values are multiples of 51/255, so bytes are exact,
 * and each pair differs by at least 64/255 on some channel.
 */
export type RGBA01 = [number, number, number, number];
export const CLEAR: RGBA01 = [0, 0, 0, 1];
export const BLUE: RGBA01 = [0.2, 0.4, 1, 1];
export const RED: RGBA01 = [1, 0.2, 0.2, 1];
export const GREEN: RGBA01 = [0.2, 1, 0.4, 1];
export const WHITE: RGBA01 = [1, 1, 1, 1];
export const YELLOW: RGBA01 = [1, 1, 0.2, 1];

/** Canvas size of the 2D stress fixtures. */
export const SIZE_2D = { width: 800, height: 600 };


/** Integer pixel bounds of a rect: the pixels whose centres lie inside it. */
function pixelBounds(rect: PixelRect) {
  return {
    x0: Math.ceil(rect.x - 0.5),
    y0: Math.ceil(rect.y - 0.5),
    x1: Math.floor(rect.x + rect.width - 0.5),
    y1: Math.floor(rect.y + rect.height - 0.5),
  };
}

function axisSamples(start: number, size: number, steps: number): number[] {
  if (size <= 0) return [];
  const last = start + size - 1;
  if (size === 1) return [start];
  const out = new Set<number>();
  for (let i = 0; i < steps; ++i) {
    out.add(Math.round(start + ((last - start) * i) / (steps - 1)));
  }
  return [...out];
}

/**
 * One shape to probe: a colour inside `inside`, and the clear colour around
 * `outside` and/or at each of `clearPoints` (canvas pixels).
 */
export interface ShapeProbe {
  inside: PixelRect;
  color: RGBA255;
  outside?: PixelRect;
  clearPoints?: [number, number][];
  clear: RGBA255;
}

/**
 * The checks of the harness's `expectRegion` (a 5×5 grid inside `inside`,
 * inset 2 px) and `expectOutside` (the clear colour 2 px past each edge of
 * `outside`, at both ends and the middle) with the same tolerance, for every
 * shape, in one page round trip. Under a heavy scene every round trip waits
 * for slow frames, and the first canvas read pays for all queued GPU work, so
 * a stress probe reads everything at once: the inset grid's bounding block
 * and one pixel per negative probe point.
 */
export async function expectShapes(page: FixturePage, shapes: ShapeProbe[]) {
  const m = DEFAULT_INSET;
  const size = await page.evaluate(() => window.__deltav!.canvasSize());
  const onCanvas = ([x, y]: [number, number]) =>
    x >= 0 && y >= 0 && x < size.width && y < size.height;

  const plans = shapes.map((s) => {
    const i = pixelBounds(s.inside);
    const xs = axisSamples(i.x0 + m, i.x1 - i.x0 + 1 - 2 * m, 5);
    const ys = axisSamples(i.y0 + m, i.y1 - i.y0 + 1 - 2 * m, 5);
    if (!xs.length || !ys.length) {
      throw new Error(`expectShapes: ${JSON.stringify(s.inside)} is too small for inset ${m}`);
    }
    const points: [number, number][] = [...(s.clearPoints || [])];
    if (s.outside) {
      const o = pixelBounds(s.outside);
      for (const x of [o.x0, Math.round((o.x0 + o.x1) / 2), o.x1]) {
        points.push([x, o.y0 - 1 - m], [x, o.y1 + 1 + m]);
      }
      for (const y of [o.y0, Math.round((o.y0 + o.y1) / 2), o.y1]) {
        points.push([o.x0 - 1 - m, y], [o.x1 + 1 + m, y]);
      }
    }
    const clearPoints = points.filter(onCanvas);
    if (clearPoints.length === 0) {
      throw new Error(
        `expectShapes: no negative probe of ${JSON.stringify(s.inside)} is on the canvas`
      );
    }
    const grid: PixelRect = {
      x: xs[0],
      y: ys[0],
      width: xs[xs.length - 1] - xs[0] + 1,
      height: ys[ys.length - 1] - ys[0] + 1,
    };
    return { s, xs, ys, grid, clearPoints };
  });

  const rects: PixelRect[] = [];
  for (const p of plans) {
    rects.push(p.grid);
    for (const [x, y] of p.clearPoints) rects.push({ x, y, width: 1, height: 1 });
  }
  const blocks = await page.evaluate(
    (rects) => rects.map((r) => window.__deltav!.readPixels(r.x, r.y, r.width, r.height)),
    rects
  );

  let next = 0;
  for (const p of plans) {
    const grid = blocks[next++];
    for (const y of p.ys) {
      for (const x of p.xs) {
        expectColor(pixelAt(grid, x - p.grid.x, y - p.grid.y), p.s.color, void 0, { x, y });
      }
    }
    for (const [x, y] of p.clearPoints) {
      expectColor(pixelAt(blocks[next++], 0, 0), p.s.clear, void 0, { x, y });
    }
  }
}

/** Probe of a rect (world = pixels): its colour inside, the clear colour around it. */
export function rectShape(rect: PixelRect, color: RGBA01, clear: RGBA01 = CLEAR): ShapeProbe {
  const px = worldRectToPixel2D(rect);
  return { inside: px, color: rgba01To255(color), outside: px, clear: rgba01To255(clear) };
}

/**
 * Probe of a circle: its colour over the largest axis-aligned square inside
 * it, the clear colour just outside its bounding square.
 */
export function circleShape(
  center: [number, number],
  radius: number,
  color: RGBA01,
  clear: RGBA01 = CLEAR
): ShapeProbe {
  const h = Math.floor(radius / Math.SQRT2);
  return {
    inside: worldRectToPixel2D({
      x: center[0] - h,
      y: center[1] - h,
      width: 2 * h,
      height: 2 * h,
    }),
    color: rgba01To255(color),
    outside: worldRectToPixel2D({
      x: center[0] - radius,
      y: center[1] - radius,
      width: 2 * radius,
      height: 2 * radius,
    }),
    clear: rgba01To255(clear),
  };
}

/**
 * Retries a probe for up to `frames` frames, for content that arrives a few
 * frames late (atlas images and glyphs load asynchronously). Rethrows the
 * last failure.
 */
export async function eventually(
  page: FixturePage,
  assertion: () => Promise<void>,
  frames = 120
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
