/**
 * This method allows an await for a requested animation frame and provides the time
 * of the frame.
 */
export function waitForFrame(): Promise<number> {
  return new Promise(requestAnimationFrame);
}
