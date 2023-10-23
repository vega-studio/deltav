/**
 * Crude and quick debouncer
 */
export function debounce(method: Function, time: number) {
  let timer: number;

  return (...args: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(function() {
      method(...args);
    }, time);
  };
}
