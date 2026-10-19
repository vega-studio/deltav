import React from "react";

import type { StressPageState } from "../../stress/stress-api.js";

/** 0–1 RGBA colour. */
export type RGBA01 = [number, number, number, number];

/** Deterministic PRNG (mulberry32): the same seed builds the same scene. */
export function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface IStressLoop {
  /** Scenario name published in `window.__deltavStress.scenario` */
  scenario: string;
  /**
   * Load frames to run after the surface is ready. Each one calls `onFrame`
   * and records its requestAnimationFrame timestamp; 0 only samples nothing
   * and is done at once.
   */
  frames: number;
  /** Work done on every load frame (mutations, churn) */
  onFrame?(frame: number, state: StressPageState): void;
}

/**
 * Publishes `window.__deltavStress` for the node side and runs the fixture's
 * load: `mountedAt` is set on the first render, `readyAt` when the returned
 * `onSurface` is called (pass it to TestSurface), and from then a plain
 * requestAnimationFrame loop (not a deltav frame command, so it never shows in
 * the leak counts) calls `onFrame` for `frames` frames and records each
 * frame's timestamp. The loop is cancelled on unmount.
 */
export function useStressLoop(props: IStressLoop) {
  const state = React.useRef<StressPageState | null>(null);
  const handle = React.useRef(0);
  const onFrame = React.useRef(props.onFrame);
  onFrame.current = props.onFrame;

  if (!state.current) {
    state.current = {
      scenario: props.scenario,
      mountedAt: performance.now(),
      readyAt: null,
      frameTimes: [],
      frame: 0,
      frames: props.frames,
      done: props.frames <= 0,
      rounds: [],
      values: {},
      error: null,
    };
    window.__deltavStress = state.current;
  }

  React.useEffect(
    () => () => {
      cancelAnimationFrame(handle.current);
      handle.current = 0;
    },
    []
  );

  const onSurface = React.useCallback(() => {
    const s = state.current!;
    s.readyAt = performance.now();
    if (s.done) return;

    const tick = (time: number) => {
      s.frameTimes.push(time);
      if (s.frame >= s.frames) {
        s.done = true;
        handle.current = 0;
        return;
      }
      try {
        onFrame.current?.(s.frame, s);
      } catch (e) {
        s.error = s.error || String((e as Error)?.stack || e);
      }
      s.frame++;
      handle.current = requestAnimationFrame(tick);
    };

    handle.current = requestAnimationFrame(tick);
  }, []);

  return { state: state.current, onSurface };
}

/** Live counts of a GL object kind, from the leak instrument. */
export function liveCount(kind: "buffers" | "textures" | "programs") {
  return window.__deltavLeaks?.snapshot()[kind] ?? -1;
}
