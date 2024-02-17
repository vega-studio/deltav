/**
 * Promise based wait wrapper for setTimeout
 */
export function wait(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
