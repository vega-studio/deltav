import { afterEach, describe, expect, it } from "@jest/globals";

import type { EasingState } from "../fixtures/interaction/handles.js";
import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { rgba01To255 } from "../harness/probe.js";
import {
  BLUE,
  CLEAR,
  expectCleared,
  expectRect,
  firstMatch,
  lastMatch,
  spec,
  waitFrames,
} from "./helpers.js";
import { callRects } from "./rects-handle.js";

/**
 * Easing: a RectangleLayer animates `location` with
 * AutoEasingMethod.linear(DURATION, DELAY). Moving the rect from FROM to TO
 * must keep it at FROM through the delay, put it at TO after the duration,
 * and in between place its left edge at
 *   FROM.x + (TO.x − FROM.x) · clamp((now − startTime) / DURATION, 0, 1)
 * where `now` is the frame time of the frame read back and `startTime` the
 * instance's easing start (which already includes the delay). Identity
 * camera: world units are canvas pixels.
 */
const SIZE = { width: 300, height: 120 };
const DURATION = 2000;
const DELAY = 1000;

const FROM: PixelRect = { x: 20, y: 40, width: 40, height: 40 };
const TO: PixelRect = { x: 220, y: 40, width: 40, height: 40 };
/** The canvas row the edge is measured on: the rect's middle row. */
const ROW = FROM.y + FROM.height / 2;

/** The left edge x of the rect drawn in the row, -1 if none. */
function leftEdge(row: number[]) {
  return firstMatch(row, rgba01To255(BLUE));
}

/** The analytic left world x for an easing state. */
function expectedX(e: EasingState) {
  const t = Math.min(1, Math.max(0, (e.now - e.startTime) / e.duration));
  return FROM.x + (TO.x - FROM.x) * t;
}

/**
 * The first pixel whose centre lies inside [x, x + w) is ceil(x − 0.5); allow
 * one pixel for rasterisation of a fractional edge.
 */
function expectEdgeAt(row: number[], x: number) {
  const left = leftEdge(row);
  const right = lastMatch(row, rgba01To255(BLUE));
  expect(Math.abs(left - Math.ceil(x - 0.5))).toBeLessThanOrEqual(1);
  expect(Math.abs(right - Math.floor(x + FROM.width - 0.5))).toBeLessThanOrEqual(
    1
  );
}

async function sample(page: FixturePage) {
  return callRects(page, "easingWithRow", "r", ROW);
}

describe("easing", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("holds the old position through the delay, interpolates linearly, ends at the new one", async () => {
    await mountCycle(
      handle.page,
      "interaction/rects",
      {
        ...SIZE,
        clear: CLEAR,
        rects: { r: spec(FROM, BLUE) },
        easing: { duration: DURATION, delay: DELAY },
      },
      async (page) => {
        // First sight never animates: the rect starts at FROM.
        await expectRect(page, FROM, BLUE);

        await callRects(page, "update", "r", { position: [TO.x, TO.y] });
        await waitFrames(page, 2);

        // Start: still inside the delay, so at the old position.
        const start = await sample(page);
        expect(start.easing).not.toBeNull();
        expect(start.easing!.duration).toBe(DURATION);
        expect(start.easing!.end).toEqual([TO.x, TO.y]);
        expect(start.easing!.now).toBeLessThan(start.easing!.startTime);
        expectEdgeAt(start.row, FROM.x);
        await expectRect(page, FROM, BLUE);

        // Mid-way: wait for a frame between 25% and 75% of the duration and
        // check the edge against the analytic interpolation of that frame.
        let mid: Awaited<ReturnType<typeof sample>> | null = null;
        for (let i = 0; i < 600 && !mid; ++i) {
          const s = await sample(page);
          const t = (s.easing!.now - s.easing!.startTime) / DURATION;
          if (t > 0.75) break;
          if (t >= 0.25) mid = s;
          else await waitFrames(page, 1);
        }
        expect(mid).not.toBeNull();
        const midX = expectedX(mid!.easing!);
        expect(midX).toBeGreaterThan(FROM.x + 0.2 * (TO.x - FROM.x));
        expect(midX).toBeLessThan(FROM.x + 0.8 * (TO.x - FROM.x));
        expectEdgeAt(mid!.row, midX);

        // After the duration: at the new position, the old spot cleared.
        await page.waitForFunction(
          ({ end }) => {
            const s = window.__dvInteractionRects!.easingWithRow("r", 0);
            return s.easing !== null && s.easing.now > s.easing.startTime + end;
          },
          { end: DURATION + 100 },
          { polling: 50, timeout: 10000 }
        );
        await waitFrames(page, 2);
        const end = await sample(page);
        expectEdgeAt(end.row, TO.x);
        await expectRect(page, TO, BLUE);
        await expectCleared(page, FROM);
      }
    );
  });
});
