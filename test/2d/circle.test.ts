import { describe, it } from "bun:test";

import type { FixturePage } from "../harness/browser.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { worldToPixel2D } from "../harness/probe.js";
import { BLUE, GREEN, type RGBA01 } from "./palette.js";
import {
  CLEAR_PX,
  expectPixel,
  polar,
  px,
  sceneProps,
  update,
  use2DPage,
} from "./util.js";

/**
 * CircleLayer: the fragment shader keeps the quad's pixels whose normalised
 * distance from the centre is below 1, with a hard edge once the radius is
 * at least 7.5 px (edgeSharpness reaches 0). So with an identity camera a
 * pixel at distance d from the centre is coloured when d < r and clear when
 * d > r. Probes sit at 0 and 0.7·r (inside) and 1.3·r (outside), at eight
 * angles.
 */
const CENTER: [number, number] = [100, 100];
const ANGLES = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i * Math.PI) / 4);

function circle(radius: number, color: RGBA01) {
  return { center: CENTER, radius, color };
}

async function probeCircle(page: FixturePage, radius: number, color: RGBA01) {
  await expectPixel(page, worldToPixel2D(CENTER), px(color));
  for (const a of ANGLES) {
    await expectPixel(page, worldToPixel2D(polar(CENTER, 0.7 * radius, a)), px(color));
    await expectPixel(page, worldToPixel2D(polar(CENTER, 1.3 * radius, a)), CLEAR_PX);
  }
}

describe("2D CircleLayer", () => {
  const handle = use2DPage();

  it("fills its radius around its centre, and nothing past it", async () => {
    await mountCycle(handle.page, "2d/circle", sceneProps([circle(40, BLUE)]), (page) =>
      probeCircle(page, 40, BLUE)
    );
  });

  it("follows a radius change", async () => {
    await mountCycle(handle.page, "2d/circle", sceneProps([circle(40, BLUE)]), async (page) => {
      await probeCircle(page, 40, BLUE);
      await update(page, sceneProps([circle(20, GREEN)]));
      await probeCircle(page, 20, GREEN);
      // 0.7 of the old radius (28 px) is now outside the new one (20 px).
      await expectPixel(page, worldToPixel2D(polar(CENTER, 28, 0)), CLEAR_PX);
    });
  });

  it("renders the same circle with the POINTS variant (usePoints)", async () => {
    await mountCycle(
      handle.page,
      "2d/circle",
      sceneProps([circle(30, GREEN)], { config: { usePoints: true } }),
      (page) => probeCircle(page, 30, GREEN)
    );
  });
});
