/**
 * Jest setup: the "node" test environment has no requestAnimationFrame, but
 * ui/src/util/frame.ts starts its command loop with it when the module loads.
 * Polyfill it (and cancelAnimationFrame) with ~60fps timers so modules that
 * import frame.ts can be loaded in tests. Timers are unref'd so they never keep
 * jest alive. Browser behaviour is untouched: this file only runs under jest.
 */
type TimerHandle = ReturnType<typeof setTimeout>;
const g = globalThis as any;

if (typeof g.requestAnimationFrame !== "function") {
  g.requestAnimationFrame = (callback: FrameRequestCallback): TimerHandle => {
    const handle = setTimeout(() => callback(performance.now()), 16);
    if (typeof (handle as any)?.unref === "function") (handle as any).unref();
    return handle;
  };
}

if (typeof g.cancelAnimationFrame !== "function") {
  g.cancelAnimationFrame = (handle: TimerHandle) => clearTimeout(handle);
}

export {};
