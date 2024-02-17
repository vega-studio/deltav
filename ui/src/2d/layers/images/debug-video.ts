import Debug from "debug";
const debug = Debug("video");

/**
 * This logs ALL events a video will fire. To see the logs simply open the console in the browser, then execute:
 * localStorage.debug = 'video';
 */
export function debugVideoEvents(video: HTMLVideoElement) {
  if (debug.enabled) {
    video.addEventListener("abort", () => debug("abort"));
    video.addEventListener("canplay", () => debug("canplay"));
    video.addEventListener("canplaythrough", () => debug("canplaythrough"));
    video.addEventListener("durationchange", () => debug("durationchange"));
    video.addEventListener("emptied", () => debug("emptied"));
    video.addEventListener("ended", () => debug("ended"));
    video.addEventListener("error", () => debug("error"));
    video.addEventListener("loadeddata", () => debug("loadeddata"));
    video.addEventListener("loadedmetadata", () => debug("loadedmetadata"));
    video.addEventListener("loadstart", () => debug("loadstart"));
    video.addEventListener("pause", () => debug("pause"));
    video.addEventListener("play", () => debug("play"));
    video.addEventListener("playing", () => debug("playing"));
    video.addEventListener("progress", () => debug("progress"));
    video.addEventListener("ratechange", () => debug("ratechange"));
    video.addEventListener("seeked", () => debug("seeked"));
    video.addEventListener("seeking", () => debug("seeking"));
    video.addEventListener("stalled", () => debug("stalled"));
    video.addEventListener("suspend", () => debug("suspend"));
    video.addEventListener("timeupdate", () => debug("timeupdate"));
    video.addEventListener("volumechange", () => debug("volumechange"));
    video.addEventListener("waiting", () => debug("waiting"));
  }
}
