import { afterEach, describe, it } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { runStress, useStressTimeout } from "./scenario.js";
import {
  BLUE,
  CLEAR,
  circleShape,
  expectShapes,
  GREEN,
  RED,
  SIZE_2D,
  WHITE,
} from "./stress-probes.js";

useStressTimeout();

/** Sentinels in the strip right of the load area, drawn on top by their own layer. */
const SENTINELS = [
  { center: [680, 100] as [number, number], radius: 30, color: RED },
  { center: [680, 300] as [number, number], radius: 30, color: GREEN },
  { center: [680, 500] as [number, number], radius: 30, color: WHITE },
];

describe("stress: 100k circles", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("draws 100k circles, keeps its sentinels correct and tears down clean", async () => {
    await runStress(handle.page, {
      name: "100k-circles",
      fixture: "stress/circles",
      props: {
        ...SIZE_2D,
        clear: CLEAR,
        count: 100000,
        seed: 1,
        color: BLUE,
        sentinels: SENTINELS,
        frames: 20,
      },
      async check(page, record) {
        await record.time("probe", () =>
          expectShapes(
            page,
            SENTINELS.map((s) => circleShape(s.center, s.radius, s.color))
          )
        );
      },
    });
  });
});
