import { describe, it } from "bun:test";

import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  worldRectToPixel2D,
} from "../harness/probe.js";
import { CLEAR, GREEN } from "./palette.js";
import { expectClearOutside, inkBounds, readyValue } from "./text-util.js";
import { CLEAR_PX, eventually, frames, px, sceneProps, use2DPage } from "./util.js";

/**
 * TextAreaLayer lays words out into labels (GlyphLayer quads) plus four
 * BorderLayer rectangles. Glyph shapes are not analytic (see label.test.ts),
 * so text is checked by its ink extent; borders are rectangles and are probed
 * exactly.
 */
describe("2D TextAreaLayer", () => {
  const handle = use2DPage();

  // Text area: 140×120 box at (30, 30), 8 px border, 36 px lines.
  const AREA: PixelRect = { x: 30, y: 30, width: 140, height: 120 };
  const BORDER = 8;
  const LINE = 36;
  /**
   * Lets the font resource finish its pending work before mountCycle
   * unmounts. A surface unmounted while its font work is pending can make the
   * next surface's text area lay every word over the first one (a race, not
   * reproducible on demand; report DELTAV-84), which would break the next
   * cycle's wrap check for a reason this suite does not test.
   */
  const settle = (page: Parameters<typeof frames>[0]) => frames(page, 30);

  const areaProps = (text: string, hasBorder: boolean) =>
    sceneProps([
      {
        origin: [AREA.x, AREA.y],
        text,
        fontSize: 32,
        color: GREEN,
        maxWidth: AREA.width,
        maxHeight: AREA.height,
        lineHeight: LINE,
        hasBorder,
        borderWidth: BORDER,
      },
    ]);

  it("wraps a long string onto more than one line", async () => {
    await mountCycle(handle.page, "2d/text-area", areaProps("wrap these words now", false), async (page) => {
      await readyValue(page, "a");
      const box = worldRectToPixel2D(AREA);
      await eventually(page, async () => {
        const ink = await inkBounds(page, box);
        // One line of text is at most one line height of ink.
        if (ink.height <= LINE) {
          throw new Error(`Text ink is ${ink.height} px tall, expected more than one line (${LINE} px)`);
        }
      });
      await expectClearOutside(page, box);
      await settle(page);
    });
  });

  it("BorderLayer colours the text area's border rectangle", async () => {
    await mountCycle(handle.page, "2d/text-area", areaProps("x", true), async (page) => {
      await readyValue(page, "a");
      // The four borders frame the box, BORDER wide, outside it.
      const outer: PixelRect = {
        x: AREA.x - BORDER,
        y: AREA.y - BORDER,
        width: AREA.width + 2 * BORDER,
        height: AREA.height + 2 * BORDER,
      };
      const sides: PixelRect[] = [
        { x: outer.x, y: outer.y, width: outer.width, height: BORDER },
        { x: outer.x, y: AREA.y + AREA.height, width: outer.width, height: BORDER },
        { x: outer.x, y: outer.y, width: BORDER, height: outer.height },
        { x: AREA.x + AREA.width, y: outer.y, width: BORDER, height: outer.height },
      ];
      await eventually(page, async () => {
        for (const side of sides) {
          await expectRegion(page, worldRectToPixel2D(side), px(GREEN));
        }
      });
      await expectOutside(page, worldRectToPixel2D(outer), CLEAR_PX);
      // Inside the frame, away from the one-letter text at the top-left.
      await expectRegion(page, worldRectToPixel2D({ x: AREA.x + 40, y: AREA.y + 50, width: 80, height: 60 }), px(CLEAR));
      await settle(page);
    });
  });
});
