import { afterEach, describe, expect, it } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { runStress, useStressTimeout } from "./scenario.js";
import { CLEAR, eventually, expectShapes, GREEN, RED, rectShape, SIZE_2D } from "./stress-probes.js";

useStressTimeout();

/** Instance 0: a solid image drawn 1:1, RED in the first set, GREEN after replacement. */
const SENTINEL = {
  position: [600, 250] as [number, number],
  size: [120, 80] as [number, number],
  colors: [RED, GREEN] as [typeof RED, typeof GREEN],
};
const SENTINEL_RECT = {
  x: SENTINEL.position[0],
  y: SENTINEL.position[1],
  width: SENTINEL.size[0],
  height: SENTINEL.size[1],
};

describe("stress: atlas pressure", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("packs 500 images into one atlas, then replaces all 500", async () => {
    const props = {
      ...SIZE_2D,
      clear: CLEAR,
      count: 500,
      imageSize: 12,
      atlasSize: 512,
      generation: 0,
      sentinel: SENTINEL,
    };

    await runStress(handle.page, {
      name: "atlas-pressure",
      fixture: "stress/atlas",
      props,
      async check(page, record) {
        await record.time("firstSet", () =>
          eventually(page, () =>
            expectShapes(page, [rectShape(SENTINEL_RECT, SENTINEL.colors[0])])
          , 240)
        );
        const first = await record.counts(page, "firstSet");

        await page.evaluate(
          (p) => window.__deltav!.update(p),
          { ...props, generation: 1 }
        );
        await record.time("replacement", () =>
          eventually(page, () =>
            expectShapes(page, [rectShape(SENTINEL_RECT, SENTINEL.colors[1])])
          , 240)
        );
        const second = await record.counts(page, "replaced");
        // Replacing images reuses the one atlas texture.
        expect(second.textures).toBe(first.textures);
      },
    });
  });
});
