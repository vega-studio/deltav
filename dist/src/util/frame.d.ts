/**
 * The structure of a command that can be injected into the queue. The time
 * provided is the time the command was executed. endTime is a time that can be
 * used
 */
declare type Command = (t: number, endTime?: number) => void;
/**
 * Method that queues up a command to be executed not on this animation frame,
 * but the next one
 */
export declare function nextFrame(command?: Command): Promise<number>;
/**
 * Method that queues up a command to be executed on the upcoming animation
 * frame.
 *
 * If a time interval is specified, the command will not execute until AT LEAST
 * the specified amount of time has lapsed.
 */
export declare function onFrame(command?: Command, interval?: number): Promise<number>;
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
export declare function onAnimationLoop(command: Command, interval?: number, duration?: number): Promise<number>;
/**
 * Halts the animation loop for a command associated with an id.
 */
export declare function stopAnimationLoop(id: Promise<number>): void;
/**
 * This method provides an ensured way to clear ALL commands queued up to fire
 * for a frame. This includes halting all: animation loops, nextFrame, and
 * onFrame commands.
 */
export declare function stopAllFrameCommands(): void;
export {};
