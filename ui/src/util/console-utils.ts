import { onAnimationLoop, stopAnimationLoop } from "./frame";

/**
 * THIS IS A DEBUGGING UTILITY AND SHOULD NOT BE IMPORTED IN ANY WAY FOR A PRODUCTION BUILD
 *
 * This is a helper method for logging on the frame loop. It will take in logs that are intended to be output but will
 * display them at a reduced frequency to eliminate flicker from the log console.
 */
export function consoleRender(logMethod: Function, refresh = 1000) {
  const logs: any[] = [];

  const loopId = onAnimationLoop(() => {
    // eslint-disable-next-line no-console
    console.clear();

    for (let i = 0, iMax = logs.length; i < iMax; ++i) {
      const log = logs[i];
      logMethod.call(console, ...log);
    }
  }, refresh);

  return Object.assign(
    (...args: any[]) => {
      logs.push(args);
    },
    {
      start: () => {
        logs.splice(0);
      },

      stop: () => {
        stopAnimationLoop(loopId);
      },
    }
  );
}
