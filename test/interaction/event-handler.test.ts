import { afterEach, describe, expect, it } from "@jest/globals";

import type { ViewEvent } from "../fixtures/interaction/handles.js";
import { type FixturePage, useFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { worldRectToPixel2D } from "../harness/probe.js";
import { BLUE, CLEAR, eventually, expectRect, spec } from "./helpers.js";

/**
 * SimpleEventHandlerJSX: mouse down, move, drag and up reach the handler with
 * coordinates that match the analytic conversion. The view's viewport starts
 * at VIEWPORT (left, top) on the canvas and its camera has offset OFFSET at
 * scale 1, and the container sits at the page's top-left, so for a page
 * point s:
 *   screen = s
 *   view   = s − (left, top)              (BaseProjection.screenToView)
 *   world  = view / scale − offset        (Projection2D.viewToWorld)
 * A marker rect drawn at worldRectToPixel2D(MARKER, { offset, viewOrigin })
 * confirms the same mapping on the rendering side.
 */
const SIZE = { width: 300, height: 200 };
const VIEWPORT = { left: 40, top: 30, width: 200, height: 140 };
const OFFSET: [number, number] = [10, 5];
const MARKER: PixelRect = { x: 20, y: 20, width: 40, height: 30 };
const CAMERA = {
  offset: OFFSET,
  viewOrigin: [VIEWPORT.left, VIEWPORT.top] as [number, number],
};

function analytic(s: [number, number]) {
  const view: [number, number] = [s[0] - VIEWPORT.left, s[1] - VIEWPORT.top];
  return {
    screen: s,
    view,
    world: [view[0] - OFFSET[0], view[1] - OFFSET[1]] as [number, number],
  };
}

async function events(page: FixturePage): Promise<ViewEvent[]> {
  return page.evaluate(() => window.__dvInteractionEvents!.events.slice());
}

/** The last recorded event of a type, waiting up to 60 frames for one. */
async function lastOf(page: FixturePage, type: ViewEvent["type"]) {
  let found: ViewEvent | undefined;
  await eventually(page, async () => {
    found = (await events(page)).filter((e) => e.type === type).pop();
    expect(found).toBeDefined();
  });
  return found!;
}

function expectAt(e: ViewEvent, s: [number, number]) {
  const want = analytic(s);
  expect(e.screen).toEqual(want.screen);
  expect(e.target).toEqual(want.view);
  expect(e.world[0]).toBeCloseTo(want.world[0], 6);
  expect(e.world[1]).toBeCloseTo(want.world[1], 6);
  expect(e.view).toMatch(/main$/);
}

describe("SimpleEventHandlerJSX", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.mouse.up();
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("receives mouse down, move and up in view coordinates", async () => {
    await mountCycle(
      handle.page,
      "interaction/events",
      {
        ...SIZE,
        clear: CLEAR,
        viewport: VIEWPORT,
        offset: OFFSET,
        rect: spec(MARKER, BLUE),
      },
      async (page) => {
        await expectRect(page, worldRectToPixel2D(MARKER, CAMERA), BLUE);
        await page.evaluate(() => window.__dvInteractionEvents!.clear());

        const hover: [number, number] = [100, 80];
        await page.mouse.move(...hover);
        expectAt(await lastOf(page, "move"), hover);

        const down: [number, number] = [120, 90];
        const up: [number, number] = [150, 110];
        await page.mouse.move(...down);
        await page.mouse.down();
        const d = await lastOf(page, "down");
        expectAt(d, down);
        expect(d.start).toEqual(analytic(down).view);

        await page.mouse.move(...up, { steps: 3 });
        const drag = await lastOf(page, "drag");
        expectAt(drag, up);
        expect(drag.start).toEqual(analytic(down).view);

        await page.mouse.up();
        const u = await lastOf(page, "up");
        expectAt(u, up);
        expect(u.start).toEqual(analytic(down).view);
      }
    );
  });
});
