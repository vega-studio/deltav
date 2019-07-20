import { Vec } from "../math/vector";
import { IEasingProps } from "../types";

/**
 * This object represents the data associated with easing. It provides the
 * information needed to make an easing equation execute to completion. It also
 * contains a few methods to aid in properly adjusting the easing values.
 */
export class EasingProps implements IEasingProps {
  delay: number = 0;
  duration: number;
  end: Vec;
  isManualStart = false;
  isTimeSet = false;
  start: Vec;
  startTime: number;

  constructor(options: IEasingProps) {
    Object.assign(this, options);
  }

  /**
   * If you manually set values for the easing properties, then you use this to return
   * the easing object back to an automated state which is where the start value is
   * the calculated current position of the output and the delay and duration is determined
   * by the easing set to the layer's IAutomatedEasingMethod value set to the layer.
   */
  setAutomatic() {
    this.isManualStart = false;
    this.isTimeSet = false;
  }

  /**
   * This controls the start value of the easing. This should be used to force a starting
   * value of the animation.
   *
   * Use setAutomatic() to return to default easing behavior.
   */
  setStart(start?: Vec) {
    if (start) {
      if (this.start.length !== start.length) {
        console.warn(
          "A manual easing adjustment provided an incompatible value for the easing type."
        );
      } else {
        this.start = start;
        this.isManualStart = true;
      }
    }
  }

  /**
   * This controls of the timing of the easing equation. This should be used to adjust
   * when a value is to be adjusted
   *
   * Use setAutomatic() to return to default easing behavior.
   */
  setTiming(delay?: number, duration?: number) {
    this.delay = delay === undefined ? this.delay : delay;
    this.duration = duration === undefined ? this.duration : duration;
    this.isTimeSet = true;
  }
}
