import { afterEach, describe, expect, it } from "bun:test";

import { useFixturePage } from "../harness/browser.js";
import { expectColor, readPixels, rgba01To255 } from "../harness/probe.js";
import { runStress, useStressTimeout } from "./scenario.js";
import { BLUE, CLEAR, eventually, SIZE_2D, WHITE } from "./stress-probes.js";

useStressTimeout();

/**
 * The sentinel label: "MMMM" at 32 px, top-left anchored at (580, 280), in
 * the sentinel strip. Its glyphs lie in the box from its origin, one em
 * (32 px) tall and at most one em per character wide: (580, 280, 128, 32).
 */
const SENTINEL = {
  origin: [580, 280] as [number, number],
  text: "MMMM",
  fontSize: 32,
  color: WHITE,
};
const BOX = {
  x: SENTINEL.origin[0],
  y: SENTINEL.origin[1],
  width: SENTINEL.text.length * SENTINEL.fontSize,
  height: SENTINEL.fontSize,
};
const ROUNDS = 10;
const EVERY = 10;

/**
 * The sentinel's box is covered: some pixel inside it has the label colour
 * (a glyph stroke's interior is fully opaque), and points 6 px past the box
 * have the clear colour.
 */
async function probeSentinel(page: Parameters<typeof readPixels>[0]) {
  const color = rgba01To255(SENTINEL.color);
  const block = await readPixels(page, {
    x: BOX.x - 6,
    y: BOX.y - 6,
    width: BOX.width + 12,
    height: BOX.height + 12,
  });
  let covered = 0;
  for (let y = 6; y < 6 + BOX.height; ++y) {
    for (let x = 6; x < 6 + BOX.width; ++x) {
      const i = (y * block.width + x) * 4;
      const px = block.data.slice(i, i + 4);
      if (px.every((v, k) => Math.abs(v - color[k]) <= 3)) covered++;
    }
  }
  if (covered === 0) {
    throw new Error(`No pixel of the sentinel label box ${JSON.stringify(BOX)} has the label colour`);
  }
  const clear = rgba01To255(CLEAR);
  const at = (x: number, y: number) => {
    const i = (y * block.width + x) * 4;
    return block.data.slice(i, i + 4) as [number, number, number, number];
  };
  const outside: [number, number][] = [
    [0, 6 + BOX.height / 2], // left of the origin
    [6 + BOX.width / 2, 0], // above the box
    [6 + BOX.width / 2, block.height - 1], // below the box
    [block.width - 1, 6 + BOX.height / 2], // right of the box
  ];
  for (const [x, y] of outside) {
    expectColor(at(x, y), clear, void 0, { x: x + BOX.x - 6, y: y + BOX.y - 6 });
  }
  return covered;
}

describe("stress: labels", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  it("changes the text of 10k labels every 10 frames without font texture growth", async () => {
    await runStress(handle.page, {
      name: "labels-glyph-churn",
      fixture: "stress/labels",
      props: {
        ...SIZE_2D,
        clear: CLEAR,
        count: 10000,
        length: 4,
        alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        every: EVERY,
        frames: ROUNDS * EVERY,
        seed: 7,
        fontSize: 12,
        color: BLUE,
        sentinel: SENTINEL,
      },
      async check(page, record, state) {
        await record.time("probe", () => eventually(page, () => probeSentinel(page).then(() => void 0)));
        const end = await record.counts(page, "end");
        const textures = state.rounds.map((r) => r.textures);
        record.set("texturesPerRound", textures);
        expect(textures.length).toBe(ROUNDS);
        // The alphabet is bounded and every round draws from it: once the
        // first rounds have seen it, the font map must stop growing.
        const settled = Math.max(textures[0], textures[1]);
        expect(Math.max(...textures.slice(2), end.textures)).toBeLessThanOrEqual(settled);
      },
    });
  });
});
