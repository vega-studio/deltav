declare type Command = (t: number) => void;
/**
 * Method that queues up a command to be executed not on this animation frame, but the next one
 */
export declare function nextFrame(command?: Command): Promise<number>;
/**
 * Method that queues up a command to be executed on the upcoming animation frame
 */
export declare function onFrame(command?: Command): Promise<number>;
/**
 * Method that queues a command to fire every animation loop. Does not stop until the returned id for the command is
 * called with stopAnimationLoop(id).
 */
export declare function onAnimationLoop(command: Command, interval?: number): number;
/**
 * Halts the animation loop for a command associated with an id.
 */
export declare function stopAnimationLoop(id: number): void;
/**
 * This method provides an ensured way to clear ALL commands queued up to fire for a frame. This includes halting all:
 * animation loops, nextFrame, and onFrame commands.
 */
export declare function stopAllFrameCommands(): void;
export {};
