import { SubTexture } from "./sub-texture";
/**
 * This object monitors a video and it's corresponding texture it is rendered to. This will ensure the video and the
 * texture are in sync with each other.
 */
export declare class VideoTextureMonitor {
    video: HTMLVideoElement;
    subTexture: SubTexture;
    /** Indictaes if this resource is valid or not */
    private isDestroyed;
    /** This is the current rendered time frame that is applied to the subtexture */
    private renderedTime;
    previousTime: number;
    playedFrames: number;
    caughtFrames: number;
    timeFrame: number;
    constructor(video: HTMLVideoElement, subTexture: SubTexture);
    /**
     * Applies all of the necessary listeners to the video object
     */
    private addEventListeners;
    /**
     * Allows all resources to be freed.
     */
    destroy(): void;
    /**
     * Performs the update operation no matter which event it  comes from
     */
    private doUpdate;
    /**
     * Render loop. We utilize this loop as all video playback events are inconsistent across browsers and have no truly
     * perfect callback
     */
    private loop;
    /**
     * Cleans up any listeners this may have registered to ensure the video does not get retained
     */
    private removeEventListeners;
}
