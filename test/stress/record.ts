import fs from "fs";
import path from "path";

import type { FixturePage } from "../harness/browser.js";
import { RESOURCE_KINDS, type ResourceSnapshot } from "../harness/host-api.js";
import { snapshotResources } from "../harness/leaks.js";
import type { StressPageState } from "./stress-api.js";

/**
 * Stress recording (D10): timings and GL object counts go to
 * `test-results/stress/<scenario>.json` (gitignored) and a one-line summary to
 * the console. Nothing here asserts a time: SwiftShader timings only compare
 * scenarios with each other.
 */

/** Where the stress records are written. */
export const STRESS_RESULTS_DIR = path.resolve(
  process.cwd(),
  "test-results",
  "stress"
);

/** Frame time statistics over the fixture's load frames, ms. */
export interface FrameStats {
  frames: number;
  mean: number;
  p95: number;
  max: number;
}

/** Mean, p95 and max of the deltas between consecutive rAF timestamps. */
export function frameStats(times: number[]): FrameStats {
  const deltas: number[] = [];
  for (let i = 1; i < times.length; ++i) deltas.push(times[i] - times[i - 1]);
  if (deltas.length === 0) return { frames: 0, mean: 0, p95: 0, max: 0 };
  const sorted = [...deltas].sort((a, b) => a - b);
  const sum = deltas.reduce((a, b) => a + b, 0);
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    frames: deltas.length,
    mean: round(sum / deltas.length),
    p95: round(sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)]),
    max: round(sorted[sorted.length - 1]),
  };
}

/** Reads `window.__deltavStress` from the page. */
export async function readStress(page: FixturePage): Promise<StressPageState> {
  const state = await page.evaluate(() => {
    const s = window.__deltavStress;
    return s ? (JSON.parse(JSON.stringify(s)) as StressPageState) : null;
  });
  if (!state) {
    throw new Error("window.__deltavStress is missing: is a stress fixture mounted?");
  }
  return state;
}

/**
 * Waits until the mounted stress fixture ran all its load frames, then throws
 * if one of them threw.
 */
export async function waitForLoad(
  page: FixturePage,
  timeout = 170000
): Promise<StressPageState> {
  await page.waitForFunction(() => Boolean(window.__deltavStress?.done), void 0, {
    timeout,
    polling: 100,
  });
  const state = await readStress(page);
  if (state.error) {
    throw new Error(`A load frame of ${state.scenario} threw:\n${state.error}`);
  }
  return state;
}

/**
 * Asserts the fixture's WebGL context raised no error and is not lost: reads
 * `getError()` and `isContextLost()` of the context of the canvas under #root.
 */
export async function expectHealthyGL(page: FixturePage): Promise<void> {
  const health = await page.evaluate(() => {
    const canvas = document.querySelector("#root canvas") as HTMLCanvasElement | null;
    if (!canvas) return { missing: true, error: 0, lost: false };
    const gl = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
    if (!gl) return { missing: true, error: 0, lost: false };
    return { missing: false, error: gl.getError(), lost: gl.isContextLost() };
  });
  if (health.missing) throw new Error("The fixture has no WebGL2 canvas");
  if (health.lost) throw new Error("The fixture's WebGL context was lost");
  if (health.error !== 0) {
    throw new Error(`The fixture's WebGL context raised GL error 0x${health.error.toString(16)}`);
  }
}

/**
 * Time, in the page, of a 1×1 canvas read. A frame's draw calls return as
 * soon as they are queued; the first read of the canvas waits until the GPU
 * (SwiftShader, on the CPU) has rasterised every queued frame, so this is the
 * scene's real raster cost, which the rAF frame times do not show.
 */
export async function gpuDrainMs(page: FixturePage): Promise<number> {
  const ms = await page.evaluate(() => {
    const t = performance.now();
    window.__deltav!.readPixels(0, 0, 1, 1);
    return performance.now() - t;
  });
  return Math.round(ms * 100) / 100;
}

/** GL object counts of a snapshot (the GL kinds plus contexts). */
function glCounts(snapshot: ResourceSnapshot) {
  const out: Record<string, number> = {};
  for (const kind of RESOURCE_KINDS) {
    if (kind === "listeners" || kind.startsWith("frame")) continue;
    out[kind] = snapshot[kind];
  }
  return out;
}

/**
 * Collects one scenario's numbers and writes them. Call `load` once the
 * fixture's load ran, `counts` for each GL snapshot worth keeping, `set` for
 * anything else, then `write` (in a `finally`, so a failing scenario still
 * leaves its numbers).
 */
export class StressRecord {
  readonly data: Record<string, unknown> = {};

  constructor(readonly scenario: string, params: Record<string, unknown>) {
    this.data.scenario = scenario;
    this.data.params = params;
  }

  /** Runs `fn` and records its wall time under `phasesMs[label]`. */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      return await fn();
    } finally {
      const phases = (this.data.phasesMs as Record<string, number>) || {};
      phases[label] = Date.now() - start;
      this.data.phasesMs = phases;
    }
  }

  set(key: string, value: unknown) {
    this.data[key] = value;
    return this;
  }

  /** Mount-to-first-frame, frame statistics, rounds and values of the load. */
  load(state: StressPageState) {
    this.data.mountToFirstFrameMs =
      state.readyAt === null
        ? null
        : Math.round((state.readyAt - state.mountedAt) * 100) / 100;
    this.data.frameTime = frameStats(state.frameTimes);
    if (state.rounds.length) this.data.rounds = state.rounds;
    if (Object.keys(state.values).length) this.data.values = state.values;
    return this;
  }

  /** Records the page's GL object counts now, under `label`. */
  async counts(page: FixturePage, label: string) {
    const all = (this.data.glCounts as Record<string, unknown>) || {};
    all[label] = glCounts(await snapshotResources(page));
    this.data.glCounts = all;
    return all[label] as Record<string, number>;
  }

  /** Writes `test-results/stress/<scenario>.json` and logs a summary line. */
  write() {
    fs.mkdirSync(STRESS_RESULTS_DIR, { recursive: true });
    const file = path.join(STRESS_RESULTS_DIR, `${this.scenario}.json`);
    fs.writeFileSync(file, JSON.stringify(this.data, null, 2) + "\n");

    const ft = this.data.frameTime as FrameStats | undefined;
    const counts = this.data.glCounts as
      | Record<string, Record<string, number>>
      | undefined;
    const loaded = counts ? Object.values(counts)[0] : undefined;
    const parts = [
      `[stress] ${this.scenario}:`,
      `mount→first frame ${this.data.mountToFirstFrameMs ?? "?"} ms`,
      ft
        ? `frames ${ft.frames} mean ${ft.mean} p95 ${ft.p95} max ${ft.max} ms`
        : "no frame samples",
    ];
    if (loaded) {
      parts.push(
        `buffers ${loaded.buffers} textures ${loaded.textures} programs ${loaded.programs}`
      );
    }
    if (this.data.totalMs !== undefined) parts.push(`total ${this.data.totalMs} ms`);
    // eslint-disable-next-line no-console
    console.log(parts.join(" | "));
  }
}
