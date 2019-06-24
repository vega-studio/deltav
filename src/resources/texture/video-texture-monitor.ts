import { onFrame } from "../../util";
import { SubTexture } from "./sub-texture";

/**
 * This object monitors a video and it's corresponding texture it is rendered to. This will ensure the video and the
 * texture are in sync with each other.
 */
export class VideoTextureMonitor {
  /** Indictaes if this resource is valid or not */
  private isDestroyed: boolean = false;
  /** This is the current rendered time frame that is applied to the subtexture */
  private renderedTime: number = -1;

  previousTime: number = -1;
  playedFrames: number = 0;
  caughtFrames: number = 0;
  timeFrame: number = 0;

  constructor(public video: HTMLVideoElement, public subTexture: SubTexture) {
    console.log("MONITORING");
    this.addEventListeners();
  }

  /**
   * Applies all of the necessary listeners to the video object
   */
  private async addEventListeners() {
    if (this.isDestroyed) return;
    this.video.addEventListener("timeupdate", this.getFrame);
    this.loop(await onFrame());
  }

  /**
   * Allows all resources to be freed.
   */
  destroy() {
    console.log("DESTROY VIDEO");
    this.video.pause();
    this.isDestroyed = true;
    this.removeEventListeners();
  }

  /**
   * Performs the update operation no matter which event it  comes from
   */
  private doUpdate = () => {
    // if (this.previousTime >= 0) {
    //   console.log(this.video.currentTime - this.previousTime);
    // }

    // this.previousTime = this.video.currentTime;

    this.playedFrames++;
    if (this.playedFrames % 60 === 0) {
      window.vid = this.video;
      console.log(
        this.caughtFrames,
        this.video
        // this.video.webkitDecodedFrameCount,
        // this.video.webkitDecodedFrameCount / this.video.currentTime
      );
      this.caughtFrames = 0;
    }

    // Only a change in time from what was currently rendered will require a render update
    if (this.video.currentTime - this.renderedTime < 0.015) {
      return;
    }

    this.caughtFrames++;

    // Make sure we don't trigger duplicate updates by tracking the time we have rendered
    this.renderedTime = this.video.currentTime;
    // Tell the sub texture to update from it's source again which will grab the newest and bestest pixels
    this.subTexture.update();
  };

  /**
   * Render loop. We utilize this loop as all video playback events are inconsistent across browsers and have no truly
   * perfect callback
   */
  private loop = (_t: number) => {
    this.doUpdate();
    if (!this.isDestroyed) onFrame(this.loop);
  };

  /**
   * Cleans up any listeners this may have registered to ensure the video does not get retained
   */
  private removeEventListeners() {
    this.video.removeEventListener("timeupdate", this.getFrame);
  }

  private getFrame = () => {
    if (this.video) {
      console.log(++this.timeFrame / this.video.currentTime);
    }
  };
}
