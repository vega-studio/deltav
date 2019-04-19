/**
 * This utility makes an operation occur in a render frame after the current render frame.
 */

let queuedCommands: Function[] = [];
let nextFrameCommands: Function[] = [];

/**
 * Frame loop that queues and shuffles commands to execute them on the frame after the frame
 * they were queued up.
 */
const loop = (time: number) => {
  // Get next loop iteration queued up
  requestAnimationFrame(loop);

  // Empty and execute all next frame commands
  for (let i = 0, iMax = nextFrameCommands.length; i < iMax; ++i) {
    const command = nextFrameCommands[i];

    if (command) {
      command(time);
    }
  }

  // Currently queued commands get put into the nextFrameCommand buffer to be
  // executed next animation frame instead of the current frame.
  nextFrameCommands = queuedCommands.slice(0);
  queuedCommands = [];
};

// Start the next frame command loop
requestAnimationFrame(loop);

/**
 * Method that queues up a command to be executed not on this animation frame, but the next one
 */
export function nextFrame(command: Function) {
  queuedCommands.push(command);
}
