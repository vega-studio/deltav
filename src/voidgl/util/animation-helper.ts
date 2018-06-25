import { LayerSurface } from '../surface';
import { IAutoEasingMethod } from './auto-easing-method';
import { Vec } from './vector';

export type AnimationDelayAccessor = (groupIndex: number, currentDelay: number) => number;
export type AnimationInstanceModificationCallback = (groupIndex: number) => void;

function isNumber(val: any): val is number {
  return !isNaN(val);
}

/**
 * This provides some methods that aids in more complicated animation tasks, such as
 * adjusting gpu animated properties with differing time delay values for each change.
 */
export class AnimationHelper {
  surface: LayerSurface;

  constructor(surface: LayerSurface) {
    this.surface = surface;
  }

  /**
   * When you want to animate properties of instances but you want them to start at differing times,
   * use this method to ensure the timings starting between the elements is correct.
   *
   * @param easingMethod This is the easing method used for the layer's property to animate
   * @param groupCount This is the number of animations desired for a given delay level
   * @param delayGap This is the amount of delay between each group. This can be a static value or
   *                 can be a dynamic callback
   */
  groupAnimation(easingMethod: IAutoEasingMethod<Vec>, groupCount: number, baseDelay: number, delayGap: number | AnimationDelayAccessor, modifyInstances: AnimationInstanceModificationCallback) {
    // Get the time of the current frame as our timing basis
    const startFrameTime = this.surface.frameMetrics.currentTime;
    // Do an initial commit to ensure all previous animated properties are committed based on the
    // Delay specified for them
    this.surface.commit(startFrameTime);

    // Loop through the the number of grouped animations to work with
    for (let i = 0; i < groupCount; ++i) {
      // Determine how much extra delay is applied for the provided group
      const gap = isNumber(delayGap) ? delayGap : delayGap(i, easingMethod.delay);
      // Apply the delay
      easingMethod.delay = baseDelay + gap * i;
      // Make the instance modifications
      modifyInstances(i);
      // Commit the instance modifications based on the current delay settings
      this.surface.commit(startFrameTime);
    }
  }
}
