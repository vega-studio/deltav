import { PromiseResolver } from "./promise-resolver.js";

/**
 * The structure of a command that can be injected into the queue. The time
 * provided is the time the command was executed. endTime is a time that can be
 * used
 */
type Command = (t: number, endTime?: number) => void;

/**
 * This identifier is the base requestAnimationFrame id that is used to later
 * stop the command queues completely
 */
let animationFrameId = -1;
/** This is the current time last frame executed. */
let currentTime = 0;

/**
 * Contains the commands to be executed after the next animation cycle (ie- not
 * this frame, but next frame)
 */
let nextQueuedCommands: Command[] = [];
/** Contains the commands to be executed immediately on next animation cycle */
let immediateQueuedCommands: [Command, number, number][] = [];
/**
 * After a frame has passed, the next queued commands filter into this queue to
 * be executed next frame
 */
let nextFrameCommands: Command[] = [];
/**
 * Commands that are going to be executed repeatedly on the animation loop.
 * [Command, interval, intervalStartTime, duration, durationStartTime]
 */
const animationLoopCommands = new Map<
  Promise<number>,
  [Command, number, number, number, number]
>();

/**
 * Frame loop that executes queued commands
 */
const loop = (time: number) => {
  currentTime = time;
  let keepLooping = false;
  const stopAnimationLoops: Promise<number>[] = [];

  // Execute all of the animation loop commands
  animationLoopCommands.forEach((command, id) => {
    keepLooping = true;
    let [commandFn, interval, intervalStartTime, duration, durationStartTime] =
      command;

    // Check to see if the command has a specified duration
    if (duration !== -1) {
      if (durationStartTime === -1) {
        durationStartTime = time;
        command[4] = time;
      }

      // If we've exceeded the duration, we fire the command one last guaranteed
      // time and flag it for removal from the loop
      if (time - durationStartTime >= duration) {
        stopAnimationLoops.push(id);
        commandFn(time, durationStartTime + duration);
        return;
      }
    }

    // Check to see if the command has interval assertions
    if (interval !== -1) {
      // Initialize interval time start
      if (intervalStartTime === -1) {
        command[2] = time;
        intervalStartTime = time;
      }

      // If we are greater than our interval we execute our command
      if (time - intervalStartTime >= interval) {
        commandFn(time);

        while (time - intervalStartTime >= interval) {
          command[2] += interval;
          intervalStartTime += interval;
        }
      }
    } else {
      commandFn(time);
    }
  });

  // Remove any commands that have exceeded their duration
  for (let i = 0, iMax = stopAnimationLoops.length; i < iMax; ++i) {
    const id = stopAnimationLoops[i];
    animationLoopCommands.delete(id);
  }

  // Instant dump the commands into a separate list in case the commands have
  // more onFrame commands called within
  const immediate = immediateQueuedCommands.slice();
  immediateQueuedCommands = [];

  // Execute all imeediately queued commands
  for (let i = 0, iMax = immediate.length; i < iMax; ++i) {
    const [command, interval, startTime] = immediate[i];

    // If an interval is not specified, then we simply execute the command
    // immediately
    if (interval <= 0) {
      if (command) {
        command(time);
      }
    }

    // If we have a specified interval, then we need to see if a certain amount
    // of time has lapsed to satisfy the interval. If the interval is not
    // satisfied, then the command is requeued to be checked next execution
    // loop.
    else {
      if (time - startTime > interval) {
        command(time);
      } else {
        keepLooping = true;
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

// Start the command loop
animationFrameId = requestAnimationFrame(loop);

/**
 * Method that queues up a command to be executed not on this animation frame,
 * but the next one
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
 * Method that queues up a command to be executed on the upcoming animation
 * frame.
 *
 * If a time interval is specified, the command will not execute until AT LEAST
 * the specified amount of time has lapsed.
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
 * Method that queues a command to fire every animation loop. Does not stop
 * until the returned id for the command is called with stopAnimationLoop(id).
 *
 * You can specify an interval to make the loop execute on the animation frame
 * but after a given lapse of time. For example: an interval of 1000 will make
 * the loop execute on the animation frame but only after 1 second has lapsed
 * since last time this command executed.
 *
 * You can also specify a duration so the commands will only execute so long as
 * the duration specified has not been exceeeded. Once the duration is met or
 * exceeded, the command will be removed from the loop queue and no longer fire.
 * There will ALWAYS be a final frame that is executed for the command that will
 * provide the time the command SHOULD HAVE finished (not necessarily the actual
 * current time).
 *
 * This method returns a promise which allows for some insight into timings on
 * the animation loop. If NO duration is specified, then the promise resolves
 * the first time the command is executed. If a duration IS specified, then the
 * promise resolves after the duration has completed.
 */
export function onAnimationLoop(
  command: Command,
  interval?: number,
  duration?: number
) {
  const id = new PromiseResolver<number>();

  const wrappedCommand: Command = (t: number, endTime?: number) => {
    command(t);

    if (duration !== void 0 && duration > 0) {
      if (endTime !== void 0) {
        id.resolve(endTime);
      }
    } else {
      id.resolve(t);
    }
  };

  animationLoopCommands.set(id.promise, [
    wrappedCommand,
    interval || -1,
    -1,
    duration || -1,
    -1,
  ]);

  if (animationFrameId === -1) {
    animationFrameId = requestAnimationFrame(loop);
  }

  return id.promise;
}

/**
 * Halts the animation loop for a command associated with an id.
 */
export function stopAnimationLoop(id: Promise<number>) {
  animationLoopCommands.delete(id);

  if (animationFrameId === -1) {
    animationFrameId = requestAnimationFrame(loop);
  }
}

/**
 * This method provides an ensured way to clear ALL commands queued up to fire
 * for a frame. This includes halting all: animation loops, nextFrame, and
 * onFrame commands.
 */
export function stopAllFrameCommands() {
  animationLoopCommands.forEach((cmd) => cmd[0](currentTime, currentTime));
  animationLoopCommands.clear();
  immediateQueuedCommands = [];
  nextQueuedCommands = [];
  nextFrameCommands = [];
}
