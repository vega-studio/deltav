import { afterEach, describe, it, jest } from "@jest/globals";

import { useFixturePage } from "../harness/browser.js";
import { runStress, STRESS_TIMEOUT } from "./scenario.js";
import { BLUE, CLEAR, expectShapes, GREEN, rectShape, SIZE_2D } from "./stress-probes.js";

jest.setTimeout(STRESS_TIMEOUT);

const SENTINEL = {
  position: [600, 250] as [number, number],
  size: [120, 80] as [number, number],
  color: GREEN,
};
const CYCLES = 50;

describe("stress: remount storm", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("mounts, probes and unmounts a mid-size scene 50 times without a leak", async () => {
    const cycleMs: number[] = [];
    let last = Date.now();

    await runStress(handle.page, {
      name: "remount-storm",
      fixture: "stress/remount",
      props: {
        ...SIZE_2D,
        clear: CLEAR,
        perLayer: 500,
        seed: 6,
        color: BLUE,
        sentinel: SENTINEL,
      },
      params: { cycles: CYCLES, perLayer: 500, layers: 4 },
      // mountCycle checks no leak after every unmount and, at the end, that
      // the page logged no error.
      cycle: { cycles: CYCLES },
      async check(page, record, state, cycle) {
        await expectShapes(page, [
          rectShape(
            {
              x: SENTINEL.position[0],
              y: SENTINEL.position[1],
              width: SENTINEL.size[0],
              height: SENTINEL.size[1],
            },
            SENTINEL.color
          ),
        ]);
        const now = Date.now();
        cycleMs.push(now - last);
        last = now;
        if (cycle === CYCLES - 1) {
          const sorted = [...cycleMs].sort((a, b) => a - b);
          record.set("cycleMs", {
            cycles: cycleMs.length,
            mean: Math.round(cycleMs.reduce((a, b) => a + b, 0) / cycleMs.length),
            max: sorted[sorted.length - 1],
            first: cycleMs[0],
            last: cycleMs[cycleMs.length - 1],
          });
          record.set(
            "mountToFirstFrameLastCycleMs",
            state.readyAt === null ? null : Math.round(state.readyAt - state.mountedAt)
          );
        }
      },
    });
  });
});
