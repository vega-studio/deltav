import { afterEach, describe, expect, it } from "bun:test";

import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { snapshotResources } from "../harness/leaks.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  readPixels,
  rgba01To255,
} from "../harness/probe.js";
import {
  BLUE,
  CLEAR,
  expectCleared,
  expectRect,
  GREEN,
  RED,
  spec,
  waitFrames,
  YELLOW,
} from "./helpers.js";
import { callRects } from "./rects-handle.js";

/**
 * Instance add, update and remove: deltav's diffing must put on screen
 * exactly the instances the provider holds, where they now are, in the colour
 * they now have. A RectangleLayer in an identity-camera View2D maps world
 * units to canvas pixels one to one (worldToPixel2D with the default camera
 * is the identity), so each world rect below is also its pixel rect.
 */
const SIZE = { width: 300, height: 200 };

const A: PixelRect = { x: 20, y: 20, width: 60, height: 40 };
const B: PixelRect = { x: 120, y: 20, width: 60, height: 40 };
const C: PixelRect = { x: 220, y: 20, width: 60, height: 40 };
/** Where A moves to: below its first spot, not overlapping it. */
const A_MOVED: PixelRect = { x: 20, y: 120, width: 60, height: 40 };

/** The 1,000-instance grid: 40 × 25 cells of 6 px holding 4 px squares. */
const GRID = {
  origin: [10, 20] as [number, number],
  columns: 40,
  cell: 6,
  size: [4, 4] as [number, number],
  color: GREEN,
};
const GRID_COUNT = 1000;

/** Every pixel of the canvas has the clear colour. */
async function expectCanvasClear(page: FixturePage) {
  const block = await readPixels(page, { x: 0, y: 0, ...SIZE });
  const clear = rgba01To255(CLEAR);
  let wrong = 0;
  let first = "";
  for (let i = 0; i < block.data.length; i += 4) {
    const px = block.data.slice(i, i + 4);
    if (px.some((v, k) => Math.abs(v - clear[k]) > 3)) {
      if (!wrong) {
        const p = i / 4;
        first = `(${p % SIZE.width}, ${Math.floor(p / SIZE.width)}) = [${px}]`;
      }
      wrong++;
    }
  }
  if (wrong) {
    throw new Error(`${wrong} pixels are not the clear colour; first ${first}`);
  }
}

describe("instance add, update and remove", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("draws added instances, follows moves and colour changes, clears removed ones", async () => {
    await mountCycle(
      handle.page,
      "interaction/rects",
      { ...SIZE, clear: CLEAR },
      async (page) => {
        // An empty provider draws nothing.
        await expectCleared(page, { x: 0, y: 0, ...SIZE });

        await callRects(page, "add", "a", spec(A, BLUE));
        await callRects(page, "add", "b", spec(B, RED));
        await callRects(page, "add", "c", spec(C, YELLOW));
        await waitFrames(page, 2);
        await expectRect(page, A, BLUE);
        await expectRect(page, B, RED);
        await expectRect(page, C, YELLOW);

        // Move: the old spot is cleared, the new spot drawn.
        await callRects(page, "update", "a", { position: [A_MOVED.x, A_MOVED.y] });
        await waitFrames(page, 2);
        await expectCleared(page, A);
        await expectRect(page, A_MOVED, BLUE);
        await expectRect(page, B, RED);

        // Colour change only.
        await callRects(page, "update", "b", { color: GREEN });
        await waitFrames(page, 2);
        await expectRect(page, B, GREEN);

        // Remove one: its pixels clear, the others stay.
        await callRects(page, "remove", "c");
        await waitFrames(page, 2);
        await expectCleared(page, C);
        await expectRect(page, A_MOVED, BLUE);
        await expectRect(page, B, GREEN);

        await callRects(page, "removeAll");
        await waitFrames(page, 2);
        await expectCanvasClear(page);
      }
    );
  });

  it("adds 1,000 instances and removes them all", async () => {
    await mountCycle(
      handle.page,
      "interaction/rects",
      { ...SIZE, clear: CLEAR },
      async (page) => {
        await callRects(page, "addGrid", "g", GRID_COUNT, GRID);
        await waitFrames(page, 2);
        expect(await callRects(page, "count")).toBe(GRID_COUNT);

        // First, last and a middle cell; each with the clear gap around it.
        // 4 px squares are too small for the 2 px inset, so probe them with
        // inset 1 (the centre 2×2) and the gap with margin 0 (1 px out).
        const cellRect = (i: number): PixelRect => ({
          x: GRID.origin[0] + (i % GRID.columns) * GRID.cell,
          y: GRID.origin[1] + Math.floor(i / GRID.columns) * GRID.cell,
          width: GRID.size[0],
          height: GRID.size[1],
        });
        for (const i of [0, 517, GRID_COUNT - 1]) {
          await expectRegion(page, cellRect(i), rgba01To255(GREEN), {
            inset: 1,
          });
          await expectOutside(page, cellRect(i), rgba01To255(CLEAR), {
            margin: 0,
          });
        }

        await callRects(page, "removeAll");
        await waitFrames(page, 2);
        expect(await callRects(page, "count")).toBe(0);
        await expectCanvasClear(page);
      }
    );
  });

  it("does not grow GPU buffers across repeated add and remove of the same count", async () => {
    await mountCycle(
      handle.page,
      "interaction/rects",
      { ...SIZE, clear: CLEAR },
      async (page) => {
        const counts: { buffers: number; textures: number; vertexArrays: number }[] =
          [];
        for (let round = 0; round < 4; ++round) {
          await callRects(page, "addGrid", `r${round}-`, GRID_COUNT, GRID);
          await waitFrames(page, 2);
          await callRects(page, "removeAll");
          await waitFrames(page, 2);
          await expectCanvasClear(page);
          const snap = await snapshotResources(page);
          counts.push({
            buffers: snap.buffers,
            textures: snap.textures,
            vertexArrays: snap.vertexArrays,
          });
        }
        // The first round may grow the layer's buffers to fit 1,000
        // instances; every later round must reuse them.
        for (const c of counts.slice(1)) expect(c).toEqual(counts[0]);
      }
    );
  });
});
