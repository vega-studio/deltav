import { PromiseResolver } from "./promise-resolver";
import { uid } from "./uid";

type Command = (t: number) => void;

let animationFrameId = -1;

let nextQueuedCommands: Command[] = [];
let immediateQueuedCommands: Command[] = [];
let nextFrameCommands: Command[] = [];
const animationLoopCommands = new Map<number, [Command, number, number]>();

/**
 * Frame loop that queues and shuffles commands to execute them on the frame after the frame
 * they were queued up.
 */
const loop = (time: number) => {
  let keepLooping = false;

  // Execute all of the animation loop commands
  animationLoopCommands.forEach(command => {
    keepLooping = true;

    if (command[1] !== -1) {
      // Initialize interval time start
      if (command[2] === -1) {
        command[2] = time;
      }

      // If we are greater than our interval we execute our command
      if (time - command[2] >= command[1]) {
        command[0](time);

        while (time - command[2] >= command[1]) {
          command[2] += command[1];
        }
      }
    } else {
      command[0](time);
    }
  });

  // Instant dump the commands into a separate list in case the commands have more onFrame commands called within
  const immediate = immediateQueuedCommands.slice();
  immediateQueuedCommands = [];

  // Execute all imeediately queued commands
  for (let i = 0, iMax = immediate.length; i < iMax; ++i) {
    const command = immediate[i];

    if (command) {
      keepLooping = true;
      command(time);
    }
  }

  // Empty and execute all next frame commands
  for (let i = 0, iMax = nextFrameCommands.length; i < iMax; ++i) {
    const command = nextFrameCommands[i];

    if (command) {
      keepLooping = true;
      command(time);
    }
  }

  // Currently queued commands get put into the nextFrameCommand buffer to be
  // executed next animation frame instead of the current frame.
  nextFrameCommands = nextQueuedCommands.slice(0);
  nextQueuedCommands = [];

  if (nextFrameCommands.length > 0) {
    keepLooping = true;
  }

  if (keepLooping) animationFrameId = requestAnimationFrame(loop);
  else animationFrameId = -1;
};

// Start the next frame command loop
requestAnimationFrame(loop);

/**
 * Method that queues up a command to be executed not on this animation frame, but the next one
 */
export function nextFrame(command?: Command) {
  const resolver = new PromiseResolver<number>();

  nextQueuedCommands.push((t: number) => {
    if (command) command(t);
    resolver.resolve(t);
  });

  if (animationFrameId === -1) {
    animationFrameId = requestAnimationFrame(loop);
  }

  return resolver.promise;
}

/**
 * Method that queues up a command to be executed on the upcoming animation frame
 */
export function onFrame(command?: Command) {
  const resolver = new PromiseResolver<number>();

  immediateQueuedCommands.push((t: number) => {
    if (command) command(t);
    resolver.resolve(t);
  });

  if (animationFrameId === -1) {
    animationFrameId = requestAnimationFrame(loop);
  }

  return resolver.promise;
}

/**
 * Method that queues a command to fire every animation loop. Does not stop until the returned id for the command is
 * called with stopAnimationLoop(id).
 */
export function onAnimationLoop(command: Command, interval?: number) {
  const id = uid();
  animationLoopCommands.set(id, [command, interval || -1, -1]);

  if (animationFrameId === -1) {
    animationFrameId = requestAnimationFrame(loop);
  }

  return id;
}

/**
 * Halts the animation loop for a command associated with an id.
 */
export function stopAnimationLoop(id: number) {
  animationLoopCommands.delete(id);

  if (animationFrameId === -1) {
    animationFrameId = requestAnimationFrame(loop);
  }
}

/**
 * This method provides an ensured way to clear ALL commands queued up to fire for a frame. This includes halting all:
 * animation loops, nextFrame, and onFrame commands.
 */
export function stopAllFrameCommands() {
  animationLoopCommands.clear();
  immediateQueuedCommands = [];
  nextQueuedCommands = [];
  nextFrameCommands = [];
}
