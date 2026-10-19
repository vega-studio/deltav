import { afterEach, describe, expect, it } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { runStress, useStressTimeout } from "./scenario.js";
import {
  BLUE,
  CLEAR,
  expectShapes,
  GREEN,
  RED,
  rectShape,
  SIZE_2D,
  WHITE,
} from "./stress-probes.js";

useStressTimeout();

/** Sentinel rects in the strip right of the churn area, top-left anchored. */
const SENTINELS = [
  { position: [600, 60] as [number, number], size: [120, 80] as [number, number], color: RED },
  { position: [600, 260] as [number, number], size: [120, 80] as [number, number], color: GREEN },
  { position: [600, 460] as [number, number], size: [120, 80] as [number, number], color: WHITE },
];

describe("stress: instance churn", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("churns 10k rectangles for 120 frames without buffer growth", async () => {
    const props = {
      ...SIZE_2D,
      clear: CLEAR,
      count: 10000,
      moved: 2000,
      removed: 1000,
      added: 1000,
      frames: 120,
      seed: 2,
      color: BLUE,
      sentinels: SENTINELS,
    };

    await runStress(handle.page, {
      name: "instance-churn",
      fixture: "stress/churn",
      props,
      async check(page, record, state) {
        // Removals and additions balance: the live count never changes.
        expect(state.values.live).toBe(props.count);
        await record.time("probe", () =>
          expectShapes(
            page,
            SENTINELS.map((s) =>
              rectShape(
                { x: s.position[0], y: s.position[1], width: s.size[0], height: s.size[1] },
                s.color
              )
            )
          )
        );
        const end = await record.counts(page, "end");
        record.set("buffersAfterFirstChurnFrame", state.values.buffersAfterFirstChurnFrame);
        expect(state.values.buffersAfterFirstChurnFrame).toBeGreaterThan(0);
        expect(end.buffers).toBe(state.values.buffersAfterFirstChurnFrame);
      },
    });
  });
});
