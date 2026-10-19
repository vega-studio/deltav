import { afterEach, describe, it } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { rgba01To255 } from "../harness/probe.js";
import { runStress, useStressTimeout } from "./scenario.js";
import { CLEAR, expectShapes, SIZE_2D } from "./stress-probes.js";

useStressTimeout();

/**
 * Orthographic View3D, camera on +z looking at the origin: the frustum is
 * ±width/2 × ±height/2 (View3D.fitViewtoViewport), so one world unit is one
 * pixel and the origin is the canvas centre. The sentinel cube (half-extent
 * 40) at the origin shows its +z face as an 80 px square around the centre.
 * CubeLayer paints faces red, black within 1% of a face edge (< 1 px here).
 */
const SENTINEL_HALF = 40;
const CENTER = [SIZE_2D.width / 2, SIZE_2D.height / 2];
const CUBE_RED = rgba01To255([1, 0, 0, 1]);

describe("stress: 3D scene graph", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("rotates 10k parented cubes for 60 frames with a correct sentinel cube", async () => {
    const face = {
      x: CENTER[0] - SENTINEL_HALF,
      y: CENTER[1] - SENTINEL_HALF,
      width: 2 * SENTINEL_HALF,
      height: 2 * SENTINEL_HALF,
    };

    await runStress(handle.page, {
      name: "3d-cubes",
      fixture: "stress/cubes",
      props: {
        ...SIZE_2D,
        clear: CLEAR,
        count: 10000,
        half: 1.5,
        // The load annulus (120..280 from the centre, cubes 3 px wide) never
        // reaches the sentinel (its corners are 57 px out) nor its negative
        // probes (4 px past its edges), at any rotation.
        innerRadius: 120,
        outerRadius: 280,
        step: 0.05,
        frames: 60,
        seed: 5,
        sentinelHalf: SENTINEL_HALF,
      },
      async check(page, record) {
        await record.time("probe", () =>
          expectShapes(page, [
            { inside: face, color: CUBE_RED, outside: face, clear: rgba01To255(CLEAR) },
          ])
        );
      },
    });
  });
});
