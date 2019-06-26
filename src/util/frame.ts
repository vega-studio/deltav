import { PromiseResolver } from "./promise-resolver";

/**
 * This utility makes an operation occur in a render frame after the current render frame.
 */

let nextQueuedCommands: Function[] = [];
let immediateQueuedCommands: Function[] = [];
let nextFrameCommands: Function[] = [];

/**
 * Frame loop that queues and shuffles commands to execute them on the frame after the frame
 * they were queued up.
 */
const loop = (time: number) => {
  // Get next loop iteration queued up
  requestAnimationFrame(loop);
  // Instant dump the commands into a separate list in case the commands have more onFrame commands called within
  const immediate = immediateQueuedCommands.slice();
  immediateQueuedCommands = [];

  // Execute all imeediately queued commands
  for (let i = 0, iMax = immediate.length; i < iMax; ++i) {
    const command = immediate[i];

    if (command) {
      command(time);
    }
  }

  // Empty and execute all next frame commands
  for (let i = 0, iMax = nextFrameCommands.length; i < iMax; ++i) {
    const command = nextFrameCommands[i];

    if (command) {
      command(time);
    }
  }

  // Currently queued commands get put into the nextFrameCommand buffer to be
  // executed next animation frame instead of the current frame.
  nextFrameCommands = nextQueuedCommands.slice(0);
  nextQueuedCommands = [];
};

// Start the next frame command loop
requestAnimationFrame(loop);

/**
 * Method that queues up a command to be executed not on this animation frame, but the next one
 */
export function nextFrame(command?: Function) {
  const resolver = new PromiseResolver();

  nextQueuedCommands.push((t: number) => {
    if (command) command(t);
    resolver.resolve();
  });

  return resolver.promise;
}

/**
 * Method that queues up a command to be executed on the upcoming animation frame
 */
export function onFrame(command?: Function) {
  const resolver = new PromiseResolver();

  immediateQueuedCommands.push((t: number) => {
    if (command) command(t);
    resolver.resolve();
  });

  return resolver.promise;
}
