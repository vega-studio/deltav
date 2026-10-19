import { describe, expect, it, test } from "bun:test";

import type { FixturePage } from "../harness/browser.js";
import type { PixelRect, RGBA255 } from "../harness/host-api.js";
import { mountCycle } from "../harness/mount-cycle.js";
import {
  expectColor,
  expectRegion,
  pixelAt,
  readPixels,
  rgba01To255,
} from "../harness/probe.js";
import {
  BLUE,
  brightness,
  CLEAR,
  type ColorRect,
  CYCLES,
  pixel,
  probeRect,
  useResourcesPage,
  WHITE,
} from "./helpers.js";

/**
 * Post-processing: every effect of react-surface/processing, each reading
 * texture content a PostProcessJSX pass computed from gl_FragCoord, so the
 * expected pixels follow from the effect's kernel.
 */

const SIZE = { width: 200, height: 150 };

/** The 7-tap kernel of GaussHorizontalBlurJSX / GaussVerticalBlurJSX. */
const GAUSS = [
  0.299478, 0.22598, 0.097046, 0.023687, 0.003279, 0.000257, 0.000011,
];

/** A linearly filtered 1-texel line sampled `p` texels from its centre. */
function linearLine(p: number) {
  return Math.max(0, 1 - Math.abs(p));
}

/**
 * BoxSampleJSX averages four samples at (±delta, ±delta) texels; across a
 * vertical line only the x offsets matter, so the value `d` pixels from the
 * line is the mean of the line sampled at d - delta and d + delta.
 */
function boxKernel(delta: number) {
  return (d: number) => (linearLine(d - delta) + linearLine(d + delta)) / 2;
}

/** The gaussian kernel value `d` pixels from the line. */
function gaussKernel(d: number) {
  return GAUSS[Math.abs(d)] ?? 0;
}

/**
 * Reads the `reach` pixels on each side of a white line on black across the
 * line (along the row `across` for a vertical line at x = `at`, or the
 * column for a horizontal one) and checks each against `kernel(d) * 255`
 * (±3), and that the row's total energy is 1 within 5%.
 */
async function expectLineProfile(
  page: FixturePage,
  line: "vertical" | "horizontal",
  at: number,
  across: number,
  kernel: (d: number) => number,
  reach: number
) {
  const rect: PixelRect =
    line === "vertical"
      ? { x: at - reach, y: across, width: 2 * reach + 1, height: 1 }
      : { x: across, y: at - reach, width: 1, height: 2 * reach + 1 };
  const block = await readPixels(page, rect);
  let energy = 0;

  for (let d = -reach; d <= reach; ++d) {
    const p =
      line === "vertical"
        ? pixelAt(block, d + reach, 0)
        : pixelAt(block, 0, d + reach);
    const v = Math.round(kernel(d) * 255);
    const where =
      line === "vertical" ? { x: at + d, y: across } : { x: across, y: at + d };
    expectColor(p, [v, v, v, 255], undefined, where);
    energy += p[0] / 255;
  }

  if (Math.abs(energy - 1) > 0.05) {
    throw new Error(`Energy across the line is ${energy}, expected 1 ±5%`);
  }
}

describe("BoxSampleJSX and gaussian blur on a single-pixel line", () => {
  const handle = useResourcesPage();

  const lineProps = (
    line: "vertical" | "horizontal",
    effect: string,
    filter: "nearest" | "linear"
  ) => ({
    ...SIZE,
    clear: CLEAR,
    line,
    at: line === "vertical" ? 100 : 75,
    effect,
    filter,
  });

  it("box up-sample (delta 0.5, linear): 0.5 on the line, 0.25 beside it", async () => {
    await mountCycle(
      handle.page,
      "resources/line-blur",
      lineProps("vertical", "box-up", "linear"),
      (page) => expectLineProfile(page, "vertical", 100, 75, boxKernel(0.5), 4),
      { cycles: CYCLES }
    );
  });

  it("box down-sample (delta 1, linear): 0 on the line, 0.5 one pixel away", async () => {
    await mountCycle(
      handle.page,
      "resources/line-blur",
      lineProps("vertical", "box-down", "linear"),
      (page) => expectLineProfile(page, "vertical", 100, 75, boxKernel(1), 4),
      { cycles: CYCLES }
    );
  });

  // DEFECT: gauss-horizontal-blur-jsx.fs declares `varying vec2 texCoord`, which PostProcessLayer also prepends, so the shader fails with "'texCoord' : redefinition" and draws nothing (report DELTAV-78)
  test.failing(
    "gauss horizontal: the value d pixels away is weight[d]",
    async () => {
      await mountCycle(
        handle.page,
        "resources/line-blur",
        lineProps("vertical", "gauss-horizontal", "nearest"),
        (page) => expectLineProfile(page, "vertical", 100, 75, gaussKernel, 7),
        { cycles: CYCLES }
      );
    }
  );

  // DEFECT: gauss-vertical-blur-jsx.fs redeclares `varying vec2 texCoord` (shader "'texCoord' : redefinition"), and steps by 1.0 / viewSize.x instead of viewSize.y, which is wrong on this 200×150 canvas (report DELTAV-78)
  test.failing(
    "gauss vertical: the value d pixels away is weight[d]",
    async () => {
      await mountCycle(
        handle.page,
        "resources/line-blur",
        lineProps("horizontal", "gauss-vertical", "nearest"),
        (page) =>
          expectLineProfile(page, "horizontal", 75, 100, gaussKernel, 7),
        { cycles: CYCLES }
      );
    }
  );
});

describe("BloomJSX", () => {
  const handle = useResourcesPage();

  const BRIGHT: ColorRect = {
    x: 40,
    y: 40,
    width: 40,
    height: 40,
    color: WHITE,
  };
  /** Far from the bright rect: no glow reaches it. */
  const DARK: ColorRect = {
    x: 140,
    y: 90,
    width: 40,
    height: 40,
    color: [0.4, 0, 0.2, 1],
  };
  const props = {
    width: 200,
    height: 160,
    clear: CLEAR,
    bright: BRIGHT,
    dark: DARK,
    samples: 3,
  };

  it("spreads a bright area beyond its rect", async () => {
    await mountCycle(
      handle.page,
      "resources/bloom",
      props,
      async (page) => {
        await expectRegion(page, BRIGHT, rgba01To255(WHITE));
        // 2 px outside the middle of each edge the glow lifts every channel
        // above the clear colour (by more than the probe tolerance).
        const midX = BRIGHT.x + BRIGHT.width / 2;
        const midY = BRIGHT.y + BRIGHT.height / 2;
        const outside: [number, number][] = [
          [BRIGHT.x - 3, midY],
          [BRIGHT.x + BRIGHT.width + 2, midY],
          [midX, BRIGHT.y - 3],
          [midX, BRIGHT.y + BRIGHT.height + 2],
        ];
        const clear = rgba01To255(CLEAR);
        for (const [x, y] of outside) {
          const p = await pixel(page, x, y);
          for (let c = 0; c < 3; ++c) {
            if (p[c] <= clear[c] + 3) {
              throw new Error(
                `Pixel (${x}, ${y}) is [${p.join(
                  ", "
                )}]: no glow above clear [${clear.join(", ")}]`
              );
            }
          }
        }
      },
      { cycles: CYCLES }
    );
  });

  it("leaves a dark area unchanged", async () => {
    await mountCycle(
      handle.page,
      "resources/bloom",
      props,
      (page) => probeRect(page, DARK, DARK.color),
      { cycles: CYCLES }
    );
  });
});

describe("TrailJSX", () => {
  const handle = useResourcesPage();

  it("leaves a trail at a moving circle's previous positions that decays with age", async () => {
    const STEPS = 5;
    const props = {
      width: 240,
      height: 100,
      clear: CLEAR,
      start: [30, 50] as [number, number],
      stride: [35, 0] as [number, number],
      step: 0,
      radius: 10,
      color: WHITE,
      intensity: 0.93,
    };
    const centreX = (step: number) => props.start[0] + step * props.stride[0];
    const y = props.start[1];

    await mountCycle(
      handle.page,
      "resources/trail",
      props,
      async (page) => {
        for (let step = 1; step <= STEPS; ++step) {
          await page.evaluate((p) => window.__deltav!.update(p), {
            ...props,
            step,
          });
        }
        // One read, so every position is sampled from the same frame.
        const row = await readPixels(page, {
          x: 0,
          y,
          width: props.width,
          height: 1,
        });
        const at = (x: number) => pixelAt(row, x, 0) as RGBA255;

        // The current position is the circle itself.
        expectColor(at(centreX(STEPS)), rgba01To255(WHITE), undefined, {
          x: centreX(STEPS),
          y,
        });
        // Older positions are lit, each dimmer than the next newer one.
        let newer = brightness(at(centreX(STEPS)));
        for (let step = STEPS - 1; step >= 0; --step) {
          const b = brightness(at(centreX(step)));
          expect(b).toBeGreaterThan(3);
          expect(b).toBeLessThan(newer);
          newer = b;
        }
        // Never visited: before the start and past the head, and between two
        // positions (the circles are 20 px wide, 35 px apart).
        const clear = rgba01To255(CLEAR);
        for (const x of [5, centreX(STEPS) + 20, centreX(0) + 17]) {
          expectColor(at(x), clear, undefined, { x, y });
        }
      },
      { cycles: CYCLES }
    );
  });
});

describe("SimplexNoiseJSX", () => {
  const handle = useResourcesPage();

  /** A grid of 10×8 probe points spread over the canvas. */
  async function noiseGrid(page: FixturePage) {
    const block = await readPixels(page, { x: 0, y: 0, ...SIZE });
    const out: RGBA255[] = [];
    for (let j = 0; j < 8; ++j) {
      for (let i = 0; i < 10; ++i) {
        out.push(pixelAt(block, 10 + i * 20, 5 + j * 20) as RGBA255);
      }
    }
    return out;
  }

  async function expectDeterministicNoise(props: Record<string, unknown>) {
    let first: RGBA255[] | undefined;
    await mountCycle(
      handle.page,
      "resources/noise",
      props,
      async (page, cycle) => {
        const grid = await noiseGrid(page);
        // Grayscale, and varying across the canvas.
        for (const p of grid) {
          expect(Math.abs(p[0] - p[1])).toBeLessThanOrEqual(1);
          expect(Math.abs(p[0] - p[2])).toBeLessThanOrEqual(1);
        }
        const values = grid.map((p) => p[0]);
        expect(
          Math.max(...values) - Math.min(...values)
        ).toBeGreaterThanOrEqual(64);
        // Every mount draws the same noise: exactly equal probes.
        if (cycle === 0) first = grid;
        else grid.forEach((p, i) => expectColor(p, first![i], 0));
      },
      { cycles: CYCLES }
    );
  }

  it("2D noise is the same on every mount and varies across the canvas", async () => {
    await expectDeterministicNoise({ ...SIZE, clear: CLEAR, scale: [20, 20] });
  });

  // DEFECT: with a fixed zOffset, SimplexNoiseJSX's ON_TRIGGER trigger starts with currentZOffset equal to zOffset, so it never fires and the noise is never drawn (report DELTAV-79)
  test.failing(
    "a fixed zOffset slice is the same on every mount and varies across the canvas",
    async () => {
      await expectDeterministicNoise({
        ...SIZE,
        clear: CLEAR,
        scale: [20, 20],
        zOffset: 0.5,
      });
    }
  );
});

describe("Post-process chain", () => {
  const handle = useResourcesPage();

  it("a chain of four passes builds, breaks down and rebuilds without leaks", async () => {
    // Two box up-samples each convolve with [1, 2, 1] / 4 across an edge, so
    // the edge profile is [1, 4, 6, 4, 1] / 16: solid from 2 px inside, clear
    // from 2 px outside, and at x0 - 2 .. x0 + 1 the colour times 1, 5, 11
    // and 15 sixteenths.
    const RECT: ColorRect = {
      x: 40,
      y: 30,
      width: 80,
      height: 60,
      color: BLUE,
    };
    const kernel = [1, 4, 6, 4, 1].map((w) => w / 16);
    const coverage = (x: number) =>
      kernel.reduce((sum, w, k) => {
        const sx = x + k - 2;
        return sum + (sx >= RECT.x && sx < RECT.x + RECT.width ? w : 0);
      }, 0);

    await mountCycle(
      handle.page,
      "resources/chain",
      { ...SIZE, clear: CLEAR, rect: RECT },
      async (page) => {
        await probeRect(page, RECT, RECT.color);
        const y = RECT.y + RECT.height / 2;
        const color = rgba01To255(RECT.color);
        for (let x = RECT.x - 3; x <= RECT.x + 2; ++x) {
          const t = coverage(x);
          const expected = color.map((c, i) =>
            i === 3 ? c : Math.round(c * t)
          ) as RGBA255;
          expectColor(await pixel(page, x, y), expected, undefined, { x, y });
        }
      },
      { cycles: 3 }
    );
  });
});
