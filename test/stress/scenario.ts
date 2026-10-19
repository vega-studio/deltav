import { expect, jest } from "bun:test";

import type { FixturePage } from "../harness/browser.js";
import type { FixtureProps } from "../harness/host-api.js";
import { mountCycle, type MountCycleOptions } from "../harness/mount-cycle.js";
import {
  expectHealthyGL,
  gpuDrainMs,
  StressRecord,
  waitForLoad,
} from "./record.js";
import type { StressPageState } from "./stress-api.js";

/** Longest a stress test may run (the ticket's cap). */
export const STRESS_TIMEOUT = 180000;

/**
 * Sets STRESS_TIMEOUT as the test timeout of the calling file; call it at the
 * file's top level. `jest.setTimeout` is per file in bun 1.4, but bun-types
 * 1.0.29 does not declare it, hence the cast.
 */
export function useStressTimeout(): void {
  (jest as unknown as { setTimeout(ms: number): void }).setTimeout(
    STRESS_TIMEOUT
  );
}

export interface StressScenario {
  /** Record name: `test-results/stress/<name>.json` */
  name: string;
  fixture: string;
  props: FixtureProps;
  /** Parameters written into the record (defaults to the props' numbers) */
  params?: Record<string, unknown>;
  /** mountCycle options; cycles default to 1 (a stress mount is expensive) */
  cycle?: MountCycleOptions;
  /**
   * The scenario's own checks, after the load ran, the GL context proved
   * healthy and the GL counts were recorded under `loaded`.
   */
  check(
    page: FixturePage,
    record: StressRecord,
    state: StressPageState,
    cycle: number
  ): Promise<void>;
}

/**
 * Runs one stress scenario through mountCycle (baseline → mount → check →
 * unmount → expectNoLeaks): waits for the fixture's load frames, records the
 * frame timings, the GL counts and the GPU drain time, asserts no GL error and
 * no context loss, runs `check`, and writes the record even when it fails.
 */
export async function runStress(page: FixturePage, scenario: StressScenario) {
  const params =
    scenario.params ||
    Object.fromEntries(
      Object.entries(scenario.props).filter(([, v]) => typeof v === "number")
    );
  const record = new StressRecord(scenario.name, params);
  const start = Date.now();

  try {
    await mountCycle(
      page,
      scenario.fixture,
      scenario.props,
      async (page, cycle) => {
        const state = await record.time("load", () => waitForLoad(page));
        if (cycle === 0) {
          record.load(state);
          await record.counts(page, "loaded");
          record.set("gpuDrainMs", await gpuDrainMs(page));
        }
        expect(state.frame).toBe(state.frames);
        await expectHealthyGL(page);
        await scenario.check(page, record, state, cycle);
        await expectHealthyGL(page);
      },
      { cycles: 1, ...scenario.cycle }
    );
  } finally {
    record.set("totalMs", Date.now() - start).write();
  }
}
