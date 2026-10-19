import { afterEach, describe, expect, it } from "@jest/globals";

import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { snapshotResources } from "../harness/leaks.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  BLUE,
  CLEAR,
  expectCleared,
  expectRect,
  RED,
  spec,
  waitFrames,
} from "./helpers.js";
import { callRects } from "./rects-handle.js";

/**
 * Layer rebuild: changing a RectangleLayer's `picking` prop makes
 * Layer.willUpdateProps call rebuildLayer, which regenerates the layer's
 * shaders and buffers (the same path rebuild-layer.stories.tsx exercises
 * with a geometry change). The pixels must stay right through every rebuild,
 * instance changes made after one must still show, and the GL object counts
 * must come back to what the same configuration had before: a rebuild
 * replaces the layer's programs and buffers, it does not add to them.
 * Identity camera: world units are canvas pixels.
 */
const SIZE = { width: 240, height: 160 };
const A: PixelRect = { x: 20, y: 20, width: 80, height: 50 };
const B: PixelRect = { x: 140, y: 90, width: 70, height: 50 };
const B_MOVED: PixelRect = { x: 140, y: 20, width: 70, height: 50 };

const BASE = {
  ...SIZE,
  clear: CLEAR,
  rects: { a: spec(A, BLUE), b: spec(B, RED) },
};

const KINDS = [
  "programs",
  "shaders",
  "buffers",
  "vertexArrays",
  "textures",
  "framebuffers",
] as const;

async function glCounts(page: FixturePage) {
  const snap = await snapshotResources(page);
  return Object.fromEntries(KINDS.map((k) => [k, snap[k]]));
}

/** The leak instrument's creation cursor: grows with every GL object made. */
async function createdSoFar(page: FixturePage) {
  return (await snapshotResources(page)).seq;
}

async function rebuildTo(page: FixturePage, picking: boolean) {
  await page.evaluate(
    (props) => window.__deltav!.update(props),
    { ...BASE, picking }
  );
  await waitFrames(page, 4);
}

describe("layer rebuild", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("keeps pixels correct and GL object counts stable across rebuilds", async () => {
    await mountCycle(
      handle.page,
      "interaction/rects",
      { ...BASE, picking: false },
      async (page) => {
        await expectRect(page, A, BLUE);
        await expectRect(page, B, RED);
        const before = await glCounts(page);

        // Idle frames create no GL object, so a growing cursor below proves
        // the rebuild really regenerated the layer.
        const seq0 = await createdSoFar(page);
        await waitFrames(page, 4);
        expect(await createdSoFar(page)).toBe(seq0);

        await rebuildTo(page, true);
        expect(await createdSoFar(page)).toBeGreaterThan(seq0);
        await expectRect(page, A, BLUE);
        await expectRect(page, B, RED);
        const picking = await glCounts(page);

        await rebuildTo(page, false);
        await expectRect(page, A, BLUE);
        await expectRect(page, B, RED);
        expect(await glCounts(page)).toEqual(before);

        // A second round trip lands on the same counts again.
        await rebuildTo(page, true);
        expect(await glCounts(page)).toEqual(picking);
        await rebuildTo(page, false);
        expect(await glCounts(page)).toEqual(before);

        // The rebuilt layer still follows instance changes.
        await callRects(page, "update", "b", {
          position: [B_MOVED.x, B_MOVED.y],
        });
        await waitFrames(page, 2);
        await expectCleared(page, B);
        await expectRect(page, B_MOVED, RED);
        await expectRect(page, A, BLUE);
      }
    );
  });
});
