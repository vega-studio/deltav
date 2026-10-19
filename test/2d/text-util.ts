/**
 * Helpers of the text tests (label.test.ts, text-area.test.ts).
 */
import type { FixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { readPixels } from "../harness/probe.js";
import { CANVAS } from "./palette.js";
import { CLEAR_PX, countNonClear, eventually } from "./util.js";

/** Margin past a text box inside which stray text pixels are tolerated. */
export const MARGIN = 3;

/** Waits until the fixture published layer `layer`'s instance `index`. */
export async function readyValue(page: FixturePage, layer: string, index = 0) {
  let value: any;
  await eventually(page, async () => {
    value = await page.evaluate(
      ({ layer, index }) => window.__fixture2d?.ready[layer]?.[index],
      { layer, index }
    );
    if (!value) throw new Error(`layer ${layer} instance ${index} is not ready`);
  });
  return value;
}

/** Pixel bounds of the non-clear pixels in `rect`, or null when there are none. */
export async function inkBounds(page: FixturePage, rect: PixelRect) {
  const block = await readPixels(page, rect);
  let minY = Infinity;
  let maxY = -Infinity;
  for (let y = 0; y < rect.height; ++y) {
    const row = block.data.slice(y * rect.width * 4, (y + 1) * rect.width * 4);
    if (countNonClear(row, CLEAR_PX) > 0) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  return { count: countNonClear(block.data, CLEAR_PX), height: maxY - minY + 1 };
}

/** Asserts every pixel of the canvas outside `box` grown by MARGIN is clear. */
export async function expectClearOutside(page: FixturePage, box: PixelRect) {
  const block = await readPixels(page, { x: 0, y: 0, ...CANVAS });
  const x0 = Math.floor(box.x) - MARGIN;
  const y0 = Math.floor(box.y) - MARGIN;
  const x1 = Math.ceil(box.x + box.width) + MARGIN;
  const y1 = Math.ceil(box.y + box.height) + MARGIN;
  const stray: string[] = [];
  for (let y = 0; y < CANVAS.height; ++y) {
    for (let x = 0; x < CANVAS.width; ++x) {
      if (x >= x0 && x < x1 && y >= y0 && y < y1) continue;
      const i = (y * CANVAS.width + x) * 4;
      if (countNonClear(block.data.slice(i, i + 4), CLEAR_PX) > 0) stray.push(`(${x}, ${y})`);
    }
  }
  if (stray.length > 0) {
    throw new Error(`${stray.length} non-clear pixels outside ${JSON.stringify(box)}: ${stray.slice(0, 5).join(" ")}`);
  }
}

