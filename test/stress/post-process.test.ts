import { afterEach, describe, it, jest, test } from "@jest/globals";

import { useFixturePage } from "../harness/browser.js";
import { rgba01To255 } from "../harness/probe.js";
import { runStress, STRESS_TIMEOUT } from "./scenario.js";
import { CLEAR, expectShapes, type RGBA01 } from "./stress-probes.js";

jest.setTimeout(STRESS_TIMEOUT);

const SIZE = 1024;
/**
 * The circle the scene draws: radius 300 at the canvas centre. (A circle, not
 * a rect: RectangleLayer does not compile into a render target, DELTAV-74.)
 */
const CENTER: [number, number] = [512, 512];
const RADIUS = 300;
/** Scene colour C; bytes 102, 51, 0. */
const COLOR: RGBA01 = [0.4, 0.2, 0, 1];

/**
 * Expected colour deep inside the circle, where every pass sees a uniform
 * input:
 * - the gauss blurs (when present) weigh 7 taps summing to 0.999998: C
 *   stays C;
 * - bloom down passes average 4 taps: `half` = C, `quarter` = C; its up pass
 *   adds up(quarter) = C onto `half` with One/One blending (views do not
 *   clear by default): `half` = 2C;
 * - the box up pass averages 4 taps of `half`: 2C; draw copies it: 2C.
 * 2C = (0.8, 0.4, 0, 1), bytes 204, 102, 0; alpha saturates at 1.
 */
const EXPECTED: RGBA01 = [0.8, 0.4, 0, 1];

describe("stress: post-process chain", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  /** The chain on a 1024² canvas, probed deep inside and well outside the circle. */
  function chain(name: string, blur: boolean) {
    return runStress(handle.page, {
      name,
      fixture: "stress/post-process",
      props: {
        size: SIZE,
        clear: CLEAR,
        center: CENTER,
        radius: RADIUS,
        color: COLOR,
        blur,
        frames: 20,
      },
      async check(page, record) {
        await record.time("probe", () =>
          expectShapes(page, [
            {
              // The middle 200 px square: its corners are 141 px from the
              // centre, so > 150 px inside the circle, far beyond the reach of
              // the 6-texel blurs and the quarter-size bloom taps.
              inside: { x: CENTER[0] - 100, y: CENTER[1] - 100, width: 200, height: 200 },
              color: rgba01To255(EXPECTED),
              // 64 px outside the circle's bounding square: beyond the blur
              // (6 px) and bloom (< 24 px at quarter size) spread, so still
              // the clear colour.
              outside: {
                x: CENTER[0] - RADIUS - 62,
                y: CENTER[1] - RADIUS - 62,
                width: 2 * RADIUS + 124,
                height: 2 * RADIUS + 124,
              },
              clear: rgba01To255(CLEAR),
            },
          ])
        );
      },
    });
  }

  // DEFECT: GaussHorizontalBlurJSX/GaussVerticalBlurJSX shaders redeclare `varying vec2 texCoord`, which PostProcessLayer already prepends, so neither compiles (report DELTAV-78)
  test.failing("runs blur H, blur V, bloom, box sample and draw on a 1024² canvas", async () => {
    await chain("post-process-chain", true);
  });

  it("runs bloom, box sample and draw on a 1024² canvas", async () => {
    await chain("post-process-no-blur", false);
  });
});
