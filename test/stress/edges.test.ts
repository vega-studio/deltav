import { afterEach, describe, it, jest } from "@jest/globals";

import { useFixturePage } from "../harness/browser.js";
import { rgba01To255 } from "../harness/probe.js";
import { runStress, STRESS_TIMEOUT } from "./scenario.js";
import { BLUE, CLEAR, expectShapes, SIZE_2D, YELLOW } from "./stress-probes.js";

jest.setTimeout(STRESS_TIMEOUT);

/**
 * The sentinel: a quadratic bezier from (580, 300) to (780, 300) with control
 * (680, 200), 16 px thick, in the sentinel strip. Its point at t = 1/2 is
 * S/4 + C/2 + E/4 = (680, 250), the apex, where the tangent is horizontal;
 * x(t) is linear, so the centre line is y = 250 + dx²/200 there. With
 * smoothness 50, t = 1/2 is a vertex of the strip.
 */
const SENTINEL = {
  start: [580, 300] as [number, number],
  end: [780, 300] as [number, number],
  control: [680, 200] as [number, number],
  thickness: 16,
  color: YELLOW,
};
const MID = [680, 250];
const HALF = SENTINEL.thickness / 2;

describe("stress: 50k bezier edges", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("draws 50k bezier edges and a correct sentinel edge", async () => {
    await runStress(handle.page, {
      name: "50k-bezier-edges",
      fixture: "stress/edges",
      props: {
        ...SIZE_2D,
        clear: CLEAR,
        count: 50000,
        seed: 3,
        color: BLUE,
        sentinel: SENTINEL,
        frames: 20,
      },
      async check(page, record) {
        await record.time("probe", () =>
          expectShapes(page, [
            {
              // ±6 px along the curve the centre line moves < 0.2 px, so a
              // 12×10 box at the midpoint lies inside the 16 px stroke.
              inside: { x: MID[0] - 6, y: MID[1] - 5, width: 12, height: 10 },
              color: rgba01To255(SENTINEL.color),
              // Above the apex (the curve's highest point) and below it: the
              // curve is nowhere within HALF of either point.
              clearPoints: [
                [MID[0], MID[1] - HALF - 6],
                [MID[0] - 6, MID[1] - HALF - 6],
                [MID[0] + 6, MID[1] - HALF - 6],
                [MID[0], MID[1] + HALF + 6],
              ],
              clear: rgba01To255(CLEAR),
            },
          ])
        );
      },
    });
  });
});
