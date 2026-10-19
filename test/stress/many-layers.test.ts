import { afterEach, describe, it } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { runStress, useStressTimeout } from "./scenario.js";
import { BLUE, CLEAR, expectShapes, rectShape, SIZE_2D, YELLOW } from "./stress-probes.js";

useStressTimeout();

const SENTINEL = {
  position: [600, 250] as [number, number],
  size: [120, 80] as [number, number],
  color: YELLOW,
};

describe("stress: many layers", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("builds 200 layers of 100 rectangles and draws the sentinel of the last", async () => {
    await runStress(handle.page, {
      name: "many-layers",
      fixture: "stress/many-layers",
      props: {
        ...SIZE_2D,
        clear: CLEAR,
        layers: 200,
        perLayer: 100,
        seed: 4,
        color: BLUE,
        sentinel: SENTINEL,
        frames: 20,
      },
      async check(page, record) {
        await record.time("probe", () =>
          expectShapes(page, [
            rectShape(
              {
                x: SENTINEL.position[0],
                y: SENTINEL.position[1],
                width: SENTINEL.size[0],
                height: SENTINEL.size[1],
              },
              SENTINEL.color
            ),
          ])
        );
      },
    });
  });
});
