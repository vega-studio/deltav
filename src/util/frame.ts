import { PromiseResolver } from "./promise-resolver";
import { uid } from "./uid";

type Command = (t: number) => void;

let animationFrameId = -1;
let currentTime = 0;

/** Contains the commands to be executed after the next animation cycle (ie- not this frame, but next frame) */
let nextQueuedCommands: Command[] = [];
/** Contains the commands to be executed immediately on next animation cycle */
let immediateQueuedCommands: [Command, number, number][] = [];
/** After a frame has passed, the next queued commands filter into this queue to be executed next frame */
let nextFrameCommands: Command[] = [];
/** Commands that are going to be executed repeatedly on the animation loop */
const animationLoopCommands = new Map<number, [Command, number, number]>();

/**
 * Frame loop that executes queued commands
 */
const loop = (time: number) => {
  currentTime = time;
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
    const [command, interval, startTime] = immediate[i];

    // If an interval is not specified, then we simply execute the command immediately
    if (interval <= 0) {
      if (command) {
        keepLooping = true;
        command(time);
      }
    }

    // If we have a specified interval, then we need to see if a certain amount of time has lapsed to satisfy the
    // interval. If the interval is not satisfied, then the command is requeued to be checked next execution loop.
    else {
      if (time - startTime > interval) {
        command(time);
      } else {
        immediateQueuedCommands.push(immediate[i]);
      }
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
 * Method that queues up a command to be executed on the upcoming animation frame.
 *
 * If a time interval is specified, the command will not execute until AT LEAST the specified amount of time has lapsed.
 */
export function onFrame(command?: Command, interval?: number) {
  const resolver = new PromiseResolver<number>();
  const wrappedCommand: Command = (t: number) => {
    if (command) command(t);
    resolver.resolve(t);
  };

  immediateQueuedCommands.push([wrappedCommand, interval || -1, currentTime]);

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
