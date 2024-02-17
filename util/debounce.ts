/**
 * Debounce decorator for methods
 */
export function debounce(timeout = 100, method: Function) {
  // This tracks the timeout id so we can cancel the timeout when a repeat call
  // streams in
  let timerId: number | undefined;

  return () => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(method, timeout);
  };
}
