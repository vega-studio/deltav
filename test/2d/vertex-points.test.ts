import { describe, it } from "bun:test";

import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  worldRectToPixel2D,
} from "../harness/probe.js";
import { CANVAS, CLEAR, GREEN } from "./palette.js";
import { CLEAR_PX, px, squareAround, use2DPage } from "./util.js";

/**
 * VertexPointsLayer: the fixture's vertex shader puts vertex i at world
 * point i with gl_PointSize S, so each point is an S×S pixel square centred
 * on the point.
 */
const POINTS: [number, number][] = [
  [40, 40],
  [150, 60],
  [100, 160],
];
const S = 10;

describe("2D VertexPointsLayer", () => {
  const handle = use2DPage();

  it("draws each vertex as a point at its pixel", async () => {
    await mountCycle(
      handle.page,
      "2d/vertex-points",
      {
        ...CANVAS,
        clear: CLEAR,
        layers: [{ name: "a", instances: [], config: { points: POINTS, pointSize: S, color: GREEN } }],
      },
      async (page) => {
        for (const p of POINTS) {
          const square = worldRectToPixel2D(squareAround(p, S / 2));
          await expectRegion(page, square, px(GREEN));
          await expectOutside(page, square, CLEAR_PX);
        }
      }
    );
  });
});
