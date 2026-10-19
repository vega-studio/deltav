import { describe, expect, it } from "bun:test";

import { mountCycle } from "../harness/mount-cycle.js";
import { worldRectToPixel2D } from "../harness/probe.js";
import { WHITE } from "./palette.js";
import { expectClearOutside, inkBounds, readyValue } from "./text-util.js";
import { eventually, sceneProps, use2DPage } from "./util.js";

/**
 * LabelLayer lays a label out into GlyphLayer quads (the only text layer
 * that draws), so this case covers both.
 *
 * Glyph shapes come from the browser's font rasteriser and are antialiased,
 * so their pixels are not analytic: these tests assert bounding-box coverage
 * (some text pixels inside the box, nothing outside the box plus a margin),
 * never individual glyph pixels.
 */
describe("2D LabelLayer", () => {
  const handle = use2DPage();

  it("LabelLayer / GlyphLayer: text renders inside its laid-out box and nowhere else", async () => {
    const origin: [number, number] = [20, 60];
    const props = sceneProps([{ origin, text: "Hello", fontSize: 32, color: WHITE }]);
    await mountCycle(handle.page, "2d/label", props, async (page) => {
      const { size } = await readyValue(page, "a");
      // A 5-letter label at 32 px is wider than one em and about one line tall.
      expect(size[0]).toBeGreaterThan(32);
      expect(size[1]).toBeGreaterThan(16);
      expect(size[1]).toBeLessThan(64);
      const box = worldRectToPixel2D({ x: origin[0], y: origin[1], width: size[0], height: size[1] });
      // Glyphs arrive once the font map has them; wait for the first ink.
      await eventually(page, async () => {
        const ink = await inkBounds(page, box);
        if (ink.count === 0) throw new Error(`No text pixel inside ${JSON.stringify(box)}`);
      });
      await expectClearOutside(page, box);
    });
  });
});
