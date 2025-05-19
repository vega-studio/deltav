/**
 * Debounce decorator for methods
 */
export function debounce(timeout = 100, method: (...args: any[]) => any) {
  // This tracks the timeout id so we can cancel the timeout when a repeat call
  // streams in
  let timerId: number | undefined;

  return (...args: any[]) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => method(...args), timeout);
  };
}

/**
 * This allows a method only to be fired once per time interval specified. This
 * is differewnt from debounce as it will not cause the method to hang up if
 * there is a constant stream of the calls.
 *
 * If a call happens when the throttle disallows it, it will be queued to run
 * when the throttle time has refreshed. This will only queue the LATEST method
 * call to be called. And if there was a queued item the throttle timer will
 * start again.
 */
export function throttle<T extends (...args: any[]) => any>(
  interval = 100,
  method: T
): T {
  const lastCall: { t: number; queue?: T; timer?: number } = { t: 0 };

  return ((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall.t > interval) {
      lastCall.t = now;
      window.clearTimeout(lastCall.timer);
      return method(...args);
    }

    window.clearTimeout(lastCall.timer);
    lastCall.queue = method;

    lastCall.timer = window.setTimeout(() => {
      lastCall.timer = void 0;
      lastCall.queue?.(...args);
    }, interval);
  }) as T;
}

/**
 * Commonly needed throttled log to help with debugging things on a tight
 * interval.
 */
export const throttledLog = throttle(200, (...args: any[]) =>
  // eslint-disable-next-line no-console
  console.log(...args)
);
