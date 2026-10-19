import { describe, expect, it, test } from "@jest/globals";

import { type FixturePage, openFixturePage } from "../harness/browser.js";
import type { PixelRect } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { pixelAt, readPixels, rgba01To255 } from "../harness/probe.js";
import {
  CLEAR,
  CYCLES,
  eventually,
  ORANGE,
  type RGBA01,
  useResourcesPage,
  WHITE,
} from "./helpers.js";

/**
 * FontJSX: a font resource renders a LabelLayer label inside the label's
 * laid-out box, and one or two fonts mount and unmount without leaks.
 */

interface Label {
  family: string;
  text: string;
  origin: [number, number];
  fontSize: number;
  color: RGBA01;
}

const SIZE = { width: 220, height: 150 };
const HELLO: Label = {
  family: "sans-serif",
  text: "Hello",
  origin: [20, 20],
  fontSize: 24,
  color: WHITE,
};
const WORLD: Label = {
  family: "sans-serif",
  text: "World",
  origin: [20, 90],
  fontSize: 24,
  color: ORANGE,
};

/** The label's box the fixture published once the label was ready. */
async function labelBox(page: FixturePage, index: number): Promise<PixelRect> {
  let box: PixelRect | undefined;
  await eventually(page, async () => {
    box = await page.evaluate((i) => window.__resourceFontBoxes?.[i], index);
    if (!box) throw new Error(`Label ${index} never reported ready`);
  });
  return box!;
}

/**
 * The advance width of `label.text` in its family and size, measured by the
 * browser's own 2D canvas text metrics: the independent expectation of how
 * wide the label lays out.
 */
async function measuredWidth(page: FixturePage, label: Label) {
  return page.evaluate(({ family, text, fontSize }) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = `${fontSize}px ${family}`;
    return ctx.measureText(text).width;
  }, label);
}

/**
 * The label is drawn inside its box: its box is as wide as the measured text
 * (±25%, kerning is estimated) and about a font size tall; pixels of the
 * label colour cover at least 5% of the box; and a 4 px ring starting 2 px
 * outside the box is entirely clear.
 */
async function expectLabelInBox(
  page: FixturePage,
  label: Label,
  index: number
) {
  const box = await labelBox(page, index);
  const width = await measuredWidth(page, label);
  expect(box.x).toBe(label.origin[0]);
  expect(box.y).toBe(label.origin[1]);
  expect(box.width).toBeGreaterThan(width * 0.75);
  expect(box.width).toBeLessThan(width * 1.25);
  expect(box.height).toBeGreaterThan(label.fontSize * 0.5);
  expect(box.height).toBeLessThan(label.fontSize * 1.5);

  const clear = rgba01To255(CLEAR);
  const color = rgba01To255(label.color);
  const ring = { gap: 2, width: 4 };
  const outer = ring.gap + ring.width;
  const x0 = Math.floor(box.x) - outer;
  const y0 = Math.floor(box.y) - outer;
  const x1 = Math.ceil(box.x + box.width) + outer;
  const y1 = Math.ceil(box.y + box.height) + outer;
  const block = await readPixels(page, {
    x: x0,
    y: y0,
    width: x1 - x0,
    height: y1 - y0,
  });

  let lit = 0;
  let inside = 0;
  for (let y = y0; y < y1; ++y) {
    for (let x = x0; x < x1; ++x) {
      const p = pixelAt(block, x - x0, y - y0);
      const inBox =
        x >= box.x &&
        x < box.x + box.width &&
        y >= box.y &&
        y < box.y + box.height;
      const inGap =
        x >= box.x - ring.gap &&
        x < box.x + box.width + ring.gap &&
        y >= box.y - ring.gap &&
        y < box.y + box.height + ring.gap;
      if (inBox) {
        inside++;
        // A glyph pixel: nearer the label colour than the clear colour on
        // every channel where they differ by at least 64.
        const isLabel = [0, 1, 2].every(
          (c) =>
            Math.abs(color[c] - clear[c]) < 64 ||
            Math.abs(p[c] - color[c]) < Math.abs(p[c] - clear[c])
        );
        if (isLabel) lit++;
      } else if (!inGap) {
        const delta = p.map((v, c) => Math.abs(v - clear[c]));
        if (delta.some((d) => d > 3)) {
          throw new Error(
            `Pixel (${x}, ${y}) outside label ${index}'s box ${JSON.stringify(
              box
            )} is [${p.join(", ")}], expected clear`
          );
        }
      }
    }
  }

  if (lit < inside * 0.05) {
    throw new Error(
      `Only ${lit} of ${inside} pixels inside label ${index}'s box have its colour`
    );
  }
}

describe("FontJSX", () => {
  const handle = useResourcesPage();

  it("renders a label inside its laid-out box", async () => {
    await mountCycle(
      handle.page,
      "resources/fonts",
      { ...SIZE, clear: CLEAR, labels: [HELLO] },
      (page) => eventually(page, () => expectLabelInBox(page, HELLO, 0)),
      { cycles: CYCLES }
    );
  });

  it("mounts and unmounts two font resources without a leak", async () => {
    await mountCycle(
      handle.page,
      "resources/fonts",
      { ...SIZE, clear: CLEAR, labels: [HELLO, WORLD] },
      async (page) => {
        await eventually(page, () => expectLabelInBox(page, HELLO, 0));
        // The second font's label has reported ready.
        await labelBox(page, 1);
      },
      { cycles: CYCLES }
    );
  });

  // DEFECT: on a fresh page, two FontJSX resources mounted together lay the second font's label out with every glyph at the label origin (no kerning advance), so "World" collapses to one glyph wide; a page that rendered one font first does not show it (report DELTAV-80)
  test.failing(
    "lays out the second font's label like the first on a fresh page",
    async () => {
      // A page of its own: the defect only shows before any font rendered.
      const page = await openFixturePage(handle.browser);
      try {
        await mountCycle(
          page,
          "resources/fonts",
          { ...SIZE, clear: CLEAR, labels: [HELLO, WORLD] },
          (page) =>
            eventually(page, () => expectLabelInBox(page, WORLD, 1), 30),
          { cycles: CYCLES }
        );
      } finally {
        await page.context().close();
      }
    }
  );
});
