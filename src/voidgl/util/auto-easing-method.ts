import { InstanceIOValue } from '../types';
import { Vec, VecMath } from './vector';

const { min, max } = Math;

function clamp(x: number, minVal: number, maxVal: number) {
  return min(max(x, minVal), maxVal);
}

/**
 * This defines a GPU enabled easing method that will be executed on the GPU to maneuver
 *
 */
export interface IAutoEasingMethod<T extends InstanceIOValue> {
  /** An easing method that should produce IDENTICAL values to the values of the gpu easing method using the exact same parameters */
  cpu(start: T, end: T, t: number): T;
  /** This adds a delay to the starting time of an easing change */
  delay: number;
  /** This is how long the easing method should last */
  duration: number;
  /**
   * An easing method written in shader language that should produce IDENTICAL
   * values to the values of the cpu easing method using the exact same parameters.
   */
  gpu: string;
  /**
   * This shall be the name of the easing method as it appears in the spu shader.
   * BE WARNED: This name is used to dedup the methods created on the shader. So,
   * if you use the same name as another ease method used on a single layer, you run
   * the risk of one overriding the other with an undefined chance of who wins.
   */
  methodName: string;
}

// GPU easing methods! Written here because it's cleaner to write `` style strings
// Against the left side of the editor

const linearGPU = `
$\{easingMethod} {
  return (end - start) * t + start;
}
`;

const easeInQuadGPU = `
$\{easingMethod} {
  float time = t * t;
  return (end - start) * time + start;
}
`;

const easeOutQuadGPU = `
$\{easingMethod} {
  float time = t * (2.0 - t);
  return (end - start) * time + start;
}
`;
const easeInOutQuadGPU = `
$\{easingMethod} {
  float time = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
  return (end - start) * time + start;
}
`;
const easeInCubicGPU = `
$\{easingMethod} {
  float time = t * t * t;
  return (end - start) * time + start;
}
`;
const easeOutCubicGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = t1 * t1 * t1 + 1.0;
  return (end - start) * time + start;
}
`;
const easeInOutCubicGPU = `
$\{easingMethod} {
  float time = t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
  return (end - start) * time + start;
}
`;
const easeInQuartGPU = `
$\{easingMethod} {
  float time = t * t * t * t;
  return (end - start) * time + start;
}
`;
const easeOutQuartGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 - t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`;
const easeInOutQuartGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`;
const easeInQuintGPU = `
$\{easingMethod} {
  float time = t * t * t * t * t;
  return (end - start) * time + start;
}
`;
const easeOutQuintGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 + t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`;
const easeInOutQuintGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * t1 * t1 * t1 * t1 * t1;
  return (end - start) * time + start;
}
`;

/**
 * Class of base AutoEasingMethods as well as helper constructs for making the methods.
 */
export class AutoEasingMethod<T extends InstanceIOValue> implements IAutoEasingMethod<T> {
  /**
   * Autoeasing methods for linear easing
   */
  static linear<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        const { add, scale, subtract } = VecMath(start);
        t = clamp(t, 0, 1);
        return add(scale(subtract(end, start), t), start);
      },
      delay,
      duration,
      gpu: linearGPU,
      methodName: 'linear',
    };
  }

  /**
   * Auto easing for Accelerating to end
   */
  static easeInQuad<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInQuadGPU,
      methodName: 'easeInQuad',
    };
  }

  /**
   * Auto easing for decelerating to end
   */
  static easeOutQuad<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t * (2 - t);
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeOutQuadGPU,
      methodName: 'easeOutQuad',
    };
  }

  /**
   * Auto easing for Accelerate to mid, then decelerate to end
   */
  static easeInOutQuad<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInOutQuadGPU,
      methodName: 'easeInOutQuad',
    };
  }

  /**
   * Auto easing for Slower acceleration
   */
  static easeInCubic<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInCubicGPU,
      methodName: 'easeInCubic',
    };
  }

  /**
   * Auto easing for Slower deceleration
   */
  static easeOutCubic<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = (--t) * t * t + 1;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeOutCubicGPU,
      methodName: 'easeOutCubic',
    };
  }

  /**
   * Auto easing for Slower acceleration to mid, and slower deceleration to end
   */
  static easeInOutCubic<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInOutCubicGPU,
      methodName: 'easeInOutCubic',
    };
  }

  /**
   * Auto easing for even Slower acceleration to end
   */
  static easeInQuart<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInQuartGPU,
      methodName: 'easeInQuart',
    };
  }

  /**
   * Auto easing for even Slower deceleration to end
   */
  static easeOutQuart<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = 1 - (--t) * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeOutQuartGPU,
      methodName: 'easeOutQuart',
    };
  }

  /**
   * Auto easing for even Slower acceleration to mid, and even slower deceleration to end
   */
  static easeInOutQuart<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInOutQuartGPU,
      methodName: 'easeInOutQuart',
    };
  }

  /**
   * Auto easing for super slow accelerating to the end
   */
  static easeInQuint<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t * t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInQuintGPU,
      methodName: 'easeInQuint',
    };
  }

  /**
   * Auto easing for super slow decelerating to the end
   */
  static easeOutQuint<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = 1 + (--t) * t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeOutQuintGPU,
      methodName: 'easeOutQuint',
    };
  }

  /**
   * Auto easing for super slow accelerating to mid and super slow decelerating to the end
   */
  static easeInOutQuint<T extends Vec>(duration: number, delay: number = 0) {
    return {
      cpu: (start: T, end: T, t: number) => {
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start);
      },
      delay,
      duration,
      gpu: easeInOutQuintGPU,
      methodName: 'easeInOutQuint',
    };
  }

  /** The easing method for the cpu */
  cpu: IAutoEasingMethod<T>['cpu'];
  /** Time before a delay  */
  delay: number = 0;
  /** The time in ms is takes to complete the animation */
  duration: number = 500;
  /** The easing method on the GPU */
  gpu: IAutoEasingMethod<T>['gpu'];
  /** Method name of the ease function on the gpu */
  methodName: string;

  constructor(cpu: IAutoEasingMethod<T>['cpu'], gpu: IAutoEasingMethod<T>['gpu'], duration?: number, method?: string) {
    this.cpu = cpu;
    this.gpu = gpu;
    this.duration = duration || 500;
    this.methodName = method || 'easingMethod';
  }
}
