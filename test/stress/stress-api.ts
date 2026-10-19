/**
 * Types shared by the stress fixtures (page side) and the stress tests (node
 * side). No runtime imports: this file is loaded in both environments.
 */

/** One per-round record a fixture adds while it runs (e.g. a count per churn round). */
export type StressRound = Record<string, number>;

/**
 * What a stress fixture publishes as `window.__deltavStress` while it is
 * mounted. Times are `performance.now()` milliseconds.
 */
export interface StressPageState {
  /** Scenario name the fixture was mounted with */
  scenario: string;
  /** When the fixture component first rendered (mount start) */
  mountedAt: number;
  /** When the surface signalled ready (pipeline built, first frame drawn) */
  readyAt: number | null;
  /** requestAnimationFrame timestamps of the fixture's frame loop */
  frameTimes: number[];
  /** Load frames run so far */
  frame: number;
  /** Load frames the fixture runs before `done` */
  frames: number;
  /** True once every load frame ran */
  done: boolean;
  /** Per-round records the fixture adds while it runs */
  rounds: StressRound[];
  /** Named values the fixture records (counts, sizes) */
  values: Record<string, number>;
  /** The first error a load frame threw, if any */
  error: string | null;
}

declare global {
  interface Window {
    __deltavStress?: StressPageState;
  }
}
