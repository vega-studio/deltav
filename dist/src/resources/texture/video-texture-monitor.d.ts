import { SubTexture } from "./sub-texture";
export declare class VideoTextureMonitor {
    video: HTMLVideoElement;
    subTexture: SubTexture;
    private isDestroyed;
    private renderedTime;
    previousTime: number;
    playedFrames: number;
    caughtFrames: number;
    timeFrame: number;
    constructor(video: HTMLVideoElement, subTexture: SubTexture);
    private addEventListeners;
    destroy(): void;
    private doUpdate;
    private loop;
    private removeEventListeners;
}
