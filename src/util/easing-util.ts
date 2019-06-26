import { Instance } from "../instance-provider";
import { IEasingControl, NOOP } from "../types";
import { nextFrame } from "./frame";

/** Handler type for discovered easing controls using the all() method */
export type EasingUtilAllHandler<T extends Instance> = (
  easing: IEasingControl,
  instance: T,
  instanceIndex: number,
  attrIndex: number
) => void;

/**
 * This contains helper methods to make setting easing values easier to instances that are a part of animated layers
 */
export class EasingUtil {
  /**
   * This finds all easing controls requested for all instances.
   *
   * If wait is true, then this method's returned promise will resolve AFTER the time
   * of all discovered easing objects has passed.
   */
  static async all<T extends Instance>(
    wait: boolean,
    instances: T[],
    layerAttributes: string[],
    adjust?: EasingUtilAllHandler<T>
  ) {
    let resolver: Function = NOOP;
    const promise = new Promise(resolve => (resolver = resolve));
    let finishedTime = 0;
    let start = 0;

    for (let i = 0, iMax = layerAttributes.length; i < iMax; ++i) {
      const attr = layerAttributes[i];

      for (let k = 0, kMax = instances.length; k < kMax; ++k) {
        const instance = instances[k];
        const easing = instance.getEasing(attr);

        if (easing) {
          if (adjust) adjust(easing, instance, k, i);
          finishedTime = Math.max((easing.delay || 0) + easing.duration);
        }
      }
    }

    // Keep looking at next frame until the animations are complete
    const checkNextFrame = (t: number) => {
      if (t - start < finishedTime) {
        nextFrame(checkNextFrame);
      } else resolver();
    };

    if (wait) {
      requestAnimationFrame(t => {
        start = t;
        checkNextFrame(t);
      });
    } else {
      resolver();
    }

    return promise;
  }
}
