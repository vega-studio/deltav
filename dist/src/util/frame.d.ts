declare type Command = (t: number) => void;
export declare function nextFrame(command?: Command): Promise<number>;
export declare function onFrame(command?: Command): Promise<number>;
export declare function onAnimationLoop(command: Command, interval?: number): number;
export declare function stopAnimationLoop(id: number): void;
export declare function stopAllFrameCommands(): void;
export {};
