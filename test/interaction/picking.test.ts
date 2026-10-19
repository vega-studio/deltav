import { afterEach, describe, expect, it, test } from "bun:test";

import type { PickEvent } from "../fixtures/interaction/handles.js";
import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  BLUE,
  CLEAR,
  eventually,
  expectPixel,
  GREEN,
  RED,
  spec,
  waitFrames,
  YELLOW,
} from "./helpers.js";

/**
 * Colour picking (PickType.SINGLE — deltav's only picking mode, which is
 * single picking: at most the top-most instance). Identity camera and the
 * container at the page's top-left, so a world point is a canvas pixel and a
 * page coordinate for page.mouse. Instances are recorded by test id.
 *
 * The shapes are squares; CircleLayer draws the circle inscribed in each
 * (centre at the square's centre, radius half its side). C and D overlap; D
 * is added after C, so it is drawn after C in the same layer and is the top
 * one in the overlap — the pixel there is D's colour, and picking must agree
 * with what is drawn.
 */
const SIZE = { width: 240, height: 160 };
const A: PixelRect = { x: 20, y: 20, width: 40, height: 40 }; // c (40, 40) r 20
const B: PixelRect = { x: 120, y: 20, width: 40, height: 40 }; // c (140, 40) r 20
const C: PixelRect = { x: 20, y: 90, width: 60, height: 60 }; // c (50, 120) r 30
const D: PixelRect = { x: 60, y: 90, width: 60, height: 60 }; // c (90, 120) r 30

const SHAPES = {
  a: spec(A, BLUE),
  b: spec(B, RED),
  c: spec(C, GREEN),
  d: spec(D, YELLOW),
};

const centre = (r: PixelRect): [number, number] => [
  Math.round(r.x + r.width / 2),
  Math.round(r.y + r.height / 2),
];
/** A point over the clear colour: right of B, outside every square. */
const EMPTY: [number, number] = [210, 70];
/** 20 px from both C's and D's centres (radius 30): inside both shapes. */
const OVERLAP: [number, number] = [70, 120];
/** 15 px from C's centre, 55 px from D's: inside C only. */
const C_ONLY: [number, number] = [35, 120];
const AWAY: [number, number] = [SIZE.width + 100, SIZE.height + 100];

async function events(page: FixturePage): Promise<PickEvent[]> {
  return page.evaluate(() => window.__dvInteractionPicking!.events.slice());
}

async function clearEvents(page: FixturePage) {
  await page.evaluate(() => window.__dvInteractionPicking!.clear());
}

/** Waits until an event of `type` with exactly `ids` has been recorded. */
async function expectEvent(
  page: FixturePage,
  type: PickEvent["type"],
  ids: string[]
) {
  await eventually(page, async () => {
    expect(await events(page)).toContainEqual({ type, ids });
  });
}

describe("picking", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.mouse.move(...AWAY);
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("fires over, out and click with the instance under the mouse, and nothing over the clear colour", async () => {
    await mountCycle(
      handle.page,
      "interaction/picking",
      { ...SIZE, clear: CLEAR, shapes: SHAPES, layer: "circle" },
      async (page) => {
        await page.mouse.move(...AWAY);
        await expectPixel(page, ...centre(A), BLUE);
        await expectPixel(page, ...centre(B), RED);
        await expectPixel(page, ...EMPTY, CLEAR);
        await clearEvents(page);

        // Over the clear colour: no instance is picked.
        await page.mouse.move(...EMPTY);
        await waitFrames(page, 10);
        await page.mouse.click(...EMPTY);
        await eventually(page, async () => {
          expect((await events(page)).map((e) => e.type)).toContain("click");
        });
        await waitFrames(page, 10);
        for (const e of await events(page)) expect(e.ids).toEqual([]);
        expect((await events(page)).map((e) => e.type)).not.toContain("over");

        // Over A: over, then a click, with A.
        await clearEvents(page);
        await page.mouse.move(...centre(A));
        await expectEvent(page, "over", ["a"]);
        await page.mouse.click(...centre(A));
        await expectEvent(page, "click", ["a"]);
        await expectEvent(page, "down", ["a"]);
        await expectEvent(page, "up", ["a"]);

        // A to B: out of A, over B.
        await clearEvents(page);
        await page.mouse.move(...centre(B));
        await expectEvent(page, "out", ["a"]);
        await expectEvent(page, "over", ["b"]);
        await page.mouse.click(...centre(B));
        await expectEvent(page, "click", ["b"]);
      }
    );
  });

  it("picks the top-most of overlapping instances", async () => {
    await mountCycle(
      handle.page,
      "interaction/picking",
      { ...SIZE, clear: CLEAR, shapes: SHAPES, layer: "circle" },
      async (page) => {
        await page.mouse.move(...AWAY);
        // What is drawn: D over C in the overlap, C alone left of it.
        await expectPixel(page, ...OVERLAP, YELLOW);
        await expectPixel(page, ...C_ONLY, GREEN);
        await clearEvents(page);

        await page.mouse.move(...OVERLAP);
        await expectEvent(page, "over", ["d"]);
        await page.mouse.click(...OVERLAP);
        await expectEvent(page, "click", ["d"]);
        // SINGLE picking never reports the covered instance.
        for (const e of await events(page)) expect(e.ids).not.toContain("c");

        await clearEvents(page);
        await page.mouse.move(...C_ONLY);
        await expectEvent(page, "out", ["d"]);
        await expectEvent(page, "over", ["c"]);
      }
    );
  });

  // DEFECT: rectangle-layer.fs writes its outline branch to `_FragColor`
  // instead of `${out: color}`, so the picking-only fragment shader deltav
  // generates for a view that renders just FragmentOutputType.PICKING fails
  // to compile ("'_FragColor' : undeclared identifier") and a RectangleLayer
  // with PickType.SINGLE can never pick. Report DELTAV-76.
  test.failing("picks a RectangleLayer instance", async () => {
    await mountCycle(
      handle.page,
      "interaction/picking",
      { ...SIZE, clear: CLEAR, shapes: SHAPES, layer: "rectangle" },
      async (page) => {
        await page.mouse.move(...AWAY);
        await expectPixel(page, ...OVERLAP, YELLOW);
        await clearEvents(page);
        await page.mouse.move(...centre(A));
        await expectEvent(page, "over", ["a"]);
        await page.mouse.move(...OVERLAP);
        await expectEvent(page, "over", ["d"]);
      }
    );
  });
});
