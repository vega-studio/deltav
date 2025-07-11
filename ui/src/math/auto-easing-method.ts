import { InstanceIOValue } from "../types.js";
import { uid } from "../util/uid.js";
import { isVec4, Vec, VecMath } from "./vector.js";

const { min, max, pow, round, sin, PI } = Math;
const GPU_PI = round(PI * 1000) / 1000;

function clamp(x: number, minVal: number, maxVal: number) {
  return min(max(x, minVal), maxVal);
}

export enum AutoEasingLoopStyle {
  /** Time will go from 0 -> 1 then stop at 1 */
  NONE = 1,
  /** Time will go from 0 -> infinity */
  CONTINUOUS = 4,
  /** Time will continuously go 0 -> 1 then 0 -> 1 then 0 -> 1 etc etc */
  REPEAT = 2,
  /** Time will continously go 0 -> 1 then 1 -> 0 then 0 -> 1 then 1 -> 0 etc etc */
  REFLECT = 3,
}

/**
 * This defines a GPU enabled easing method that will be executed on the GPU
 */
export interface IAutoEasingMethod<T extends InstanceIOValue> {
  /**
   * An easing method that should produce IDENTICAL values to the values of the
   * gpu easing method using the exact same parameters
   */
  cpu(start: T, end: T, t: number, out?: T): T;
  /** This adds a delay to the starting time of an easing change */
  delay: number;
  /** This is how long the easing method should last */
  duration: number;
  /**
   * An easing method written in shader language that should produce IDENTICAL
   * values to the values of the cpu easing method using the exact same
   * parameters.
   */
  gpu: string;
  /**
   * This defines the looping style of the easing.
   */
  loop: AutoEasingLoopStyle;
  /**
   * This shall be the name of the easing method as it appears in the spu
   * shader. BE WARNED: This name is used to dedup the methods created on the
   * shader. So, if you use the same name as another ease method used on a
   * single layer, you run the risk of one overriding the other with an
   * undefined chance of who wins.
   */
  methodName: string;
  /**
   * A unique identifier for the auto easing method.
   */
  uid: number;

  /**
   * This lets you modify some auto easing validation rules.
   */
  validation?: {
    ignoreEndValueCheck?: boolean;
    ignoreOverTimeCheck?: boolean;
  };
}

// GPU easing methods! Written here because it's cleaner to write `` style
// strings Against the left side of the editor

const immediateGPU = `
$\{easingMethod} {
  return end;
}
`;

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

const easeOutElasticGPU = `
$\{easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${GPU_PI}) / p) + 1.0;
  return (end - start) * time + start;
}
`;

const easeBackInGPU = `
$\{easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${GPU_PI});
  return (end - start) * time + start;
}
`;

const easeBackOutGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float a = 1.7;
  float time = (t1 * t1 * ((a + 1.0) * t1 + a) + 1.0);
  return (end - start) * time + start;
}
`;

const easeBackInOutGPU = `
$\{easingMethod} {
  float a = 1.4;
  float a1 = a * 1.525;
  float t1 = t / 0.5;
  float t2 = t1 - 2.0;
  float time =
    (t1 < 1.0) ? 0.5 * (t1 * t1 * (a1 + 1.0) * t1 - a1) :
    0.5 * (t2 * t2 * ((a1 + 1.0) * t2 + a1) + 2.0)
  ;

  return (end - start) * time + start;
}
`;

const continuousSinusoidalGPU = `
$\{easingMethod} {
  $\{T} direction = end - start;
  return start + direction * 0.5 + direction * sin(t * ${GPU_PI} * 2.0) * 0.5;
}
`;

const slerpQuatLinearGPU = `
$\{easingMethod} {
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - t, t),
    vec2(sin((1.0 - t) * omega) / sinom, sin(t * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInQuadGPU = `
$\{easingMethod} {
  float time = t * t;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatOutQuadGPU = `
$\{easingMethod} {
  float time = t * (2.0 - t);
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInOutQuadGPU = `
$\{easingMethod} {
  float time = t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInCubicGPU = `
$\{easingMethod} {
  float time = t * t * t;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatOutCubicGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = t1 * t1 * t1 + 1.0;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInOutCubicGPU = `
$\{easingMethod} {
  float time = t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInQuartGPU = `
$\{easingMethod} {
  float time = t * t * t * t;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatOutQuartGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 - t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInOutQuartGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 8.0 * t * t * t * t : 1.0 - 8.0 * t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInQuintGPU = `
$\{easingMethod} {
  float time = t * t * t * t * t;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatOutQuintGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = 1.0 + t1 * t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatInOutQuintGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float time = t < 0.5 ? 16.0 * t * t * t * t * t : 1.0 + 16.0 * t1 * t1 * t1 * t1 * t1;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatOutElasticGPU = `
$\{easingMethod} {
  float p = 0.3;
  float time = pow(2.0, -10.0 * t) * sin((t - p / 4.0) * (2.0 * ${GPU_PI}) / p) + 1.0;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatBackInGPU = `
$\{easingMethod} {
  float time = t * t * t - t * 1.05 * sin(t * ${GPU_PI});
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatBackOutGPU = `
$\{easingMethod} {
  float t1 = t - 1.0;
  float a = 1.7;
  float time = (t1 * t1 * ((a + 1.0) * t1 + a) + 1.0);
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

const slerpQuatBackInOutGPU = `
$\{easingMethod} {
  float a = 1.4;
  float a1 = a * 1.525;
  float t1 = t / 0.5;
  float t2 = t1 - 2.0;
  float time =
    (t1 < 1.0) ? 0.5 * (t1 * t1 * (a1 + 1.0) * t1 - a1) :
    0.5 * (t2 * t2 * ((a1 + 1.0) * t2 + a1) + 2.0)
  ;
  float cosom = dot(start, end);
  $\{T} end1 = mix(end, -end, float(cosom < 0.0));
  cosom = mix(cosom, -cosom, float(cosom < 0.0));

  float omega = acos(cosom);
  float sinom = sin(omega);

  vec2 scale = mix(
    vec2(1.0 - time, time),
    vec2(sin((1.0 - time) * omega) / sinom, sin(time * omega) / sinom),
    float(1.0 - cosom > 0.0000001)
  );

  return scale.x * start + scale.y * end1;
}
`;

/**
 * Class of base AutoEasingMethods as well as helper constructs for making the methods.
 */
export class AutoEasingMethod<T extends InstanceIOValue>
  implements IAutoEasingMethod<T>
{
  /**
   * Autoeasing methods for linear easing
   */
  static immediate<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, _t: number, out?: T) => {
        const { copy } = VecMath(start);
        return copy(end, out);
      },
      delay,
      duration,
      gpu: immediateGPU,
      loop,
      methodName: "immediate",
    };
  }

  /**
   * Autoeasing methods for linear easing
   */
  static linear<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        const { add, scale, subtract } = VecMath(start);
        t = clamp(t, 0, 1);
        return add(scale(subtract(end, start), t), start, out);
      },
      delay,
      duration,
      gpu: linearGPU,
      loop,
      methodName: "linear",
    };
  }

  /**
   * Auto easing for Accelerating to end
   */
  static easeInQuad<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInQuadGPU,
      loop,
      methodName: "easeInQuad",
    };
  }

  /**
   * Auto easing for decelerating to end
   */
  static easeOutQuad<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = t * (2 - t);
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeOutQuadGPU,
      loop,
      methodName: "easeOutQuad",
    };
  }

  /**
   * Auto easing for Accelerate to mid, then decelerate to end
   */
  static easeInOutQuad<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInOutQuadGPU,
      loop,
      methodName: "easeInOutQuad",
    };
  }

  /**
   * Auto easing for Slower acceleration
   */
  static easeInCubic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInCubicGPU,
      loop,
      methodName: "easeInCubic",
    };
  }

  /**
   * Auto easing for Slower deceleration
   */
  static easeOutCubic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = --t * t * t + 1;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeOutCubicGPU,
      loop,
      methodName: "easeOutCubic",
    };
  }

  /**
   * Auto easing for Slower acceleration to mid, and slower deceleration to end
   */
  static easeInOutCubic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time =
          t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInOutCubicGPU,
      loop,
      methodName: "easeInOutCubic",
    };
  }

  /**
   * Auto easing for even Slower acceleration to end
   */
  static easeInQuart<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInQuartGPU,
      loop,
      methodName: "easeInQuart",
    };
  }

  /**
   * Auto easing for even Slower deceleration to end
   */
  static easeOutQuart<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = 1 - --t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeOutQuartGPU,
      loop,
      methodName: "easeOutQuart",
    };
  }

  /**
   * Auto easing for even Slower acceleration to mid, and even slower deceleration to end
   */
  static easeInOutQuart<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInOutQuartGPU,
      loop,
      methodName: "easeInOutQuart",
    };
  }

  /**
   * Auto easing for super slow accelerating to the end
   */
  static easeInQuint<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = t * t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInQuintGPU,
      loop,
      methodName: "easeInQuint",
    };
  }

  /**
   * Auto easing for super slow decelerating to the end
   */
  static easeOutQuint<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time = 1 + --t * t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeOutQuintGPU,
      loop,
      methodName: "easeOutQuint",
    };
  }

  /**
   * Auto easing for super slow accelerating to mid and super slow decelerating to the end
   */
  static easeInOutQuint<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const time =
          t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeInOutQuintGPU,
      loop,
      methodName: "easeInOutQuint",
    };
  }

  /**
   * Auto easing for elastic effect
   */
  static easeOutElastic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const p = 0.3;
        const time = pow(2, -10 * t) * sin(((t - p / 4) * (2 * PI)) / p) + 1;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeOutElasticGPU,
      loop,
      methodName: "easeOutElastic",
    };
  }

  /**
   * Auto easing for retracting first then shooting to the end
   */
  static easeBackIn<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const a = 1.05;
        const time = t * t * t - t * a * sin(t * PI);
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeBackInGPU,
      loop,
      methodName: "easeBackIn",
    };
  }

  /**
   * Auto easing for overshooting at the end
   */
  static easeBackOut<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const a = 1.7;
        const t1 = t - 1;
        const time = t1 * t1 * ((a + 1) * t1 + a) + 1;
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeBackOutGPU,
      loop,
      methodName: "easeBackOut",
    };
  }

  /**
   * Auto easing for overshooting at the end
   */
  static easeBackInOut<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        t = clamp(t, 0, 1);
        const a = 1.7;
        const a1 = a * 1.525;
        const t1 = t / 0.5;
        const t2 = t1 - 2;
        const time =
          t1 < 1
            ? 0.5 * (t1 * t1 * (a1 + 1) * t1 - a1)
            : 0.5 * (t2 * t2 * ((a1 + 1) * t2 + a1) + 2);
        const { add, scale, subtract } = VecMath(start);
        return add(scale(subtract(end, start), time), start, out);
      },
      delay,
      duration,
      gpu: easeBackInOutGPU,
      loop,
      methodName: "easeBackInOut",
    };
  }

  /**
   * This is an easing method that performs a sinusoidal wave where the amplitude is
   * (start - end) * 2 and the wave starts at the start value.
   *
   * This is intended to work best with the CONTINUOUS loop style.
   */
  static continuousSinusoidal<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.CONTINUOUS
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        const { add, scale, subtract } = VecMath(start);
        t = clamp(t, 0, 1);
        const direction = subtract(end, start);
        const halfDirection = scale(direction, 0.5);
        // const amplitude = length(direction) * 2.0;
        return add(
          add(start, halfDirection),
          scale(halfDirection, sin(t * PI * 2) * 1.0),
          out
        );
      },
      delay,
      duration,
      gpu: continuousSinusoidalGPU,
      loop,
      methodName: "repeatingSinusoidal",

      // Since this is sinusoidial and operates off of a continuous time structure
      validation: {
        // When time = 1 our value will = start and NOT end
        ignoreEndValueCheck: true,
        // When the time is > 1 our value will not clamp to the value at 1.
        ignoreOverTimeCheck: true,
      },
    };
  }

  static slerpQuatLinear<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }

        t = clamp(t, 0, 1);
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, t, out);
      },
      delay,
      duration,
      gpu: slerpQuatLinearGPU,
      loop,
      methodName: "slerpQuatLinear",
    };
  }

  static slerpQuatInQuad<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInQuadGPU,
      loop,
      methodName: "slerpQuatInQuad",
    };
  }

  static slerpQuatOutQuad<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = t * (2 - t);
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatOutQuadGPU,
      loop,
      methodName: "slerpQuatOutQuad",
    };
  }

  static slerpQuatInOutQuad<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInOutQuadGPU,
      loop,
      methodName: "slerpQuatInOutQuad",
    };
  }

  static slerpQuatInCubic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = t * t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInCubicGPU,
      loop,
      methodName: "slerpQuatInCubic",
    };
  }

  static slerpQuatOutCubic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = --t * t * t + 1;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatOutCubicGPU,
      loop,
      methodName: "slerpQuatOutCubic",
    };
  }

  static slerpQuatInOutCubic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time =
          t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInOutCubicGPU,
      loop,
      methodName: "slerpQuatInOutCubic",
    };
  }

  static slerpQuatInQuart<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = t * t * t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInQuartGPU,
      loop,
      methodName: "slerpQuatInQuart",
    };
  }

  static slerpQuatOutQuart<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = 1 - --t * t * t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatOutQuartGPU,
      loop,
      methodName: "slerpQuatOutQuart",
    };
  }

  static slerpQuatInOutQuart<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInOutQuartGPU,
      loop,
      methodName: "slerpQuatInOutQuart",
    };
  }

  static slerpQuatInQuint<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = t * t * t * t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInQuintGPU,
      loop,
      methodName: "slerpQuatInQuint",
    };
  }

  static slerpQuatOutQuint<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time = 1 + --t * t * t * t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatOutQuintGPU,
      loop,
      methodName: "slerpQuatOutQuint",
    };
  }

  static slerpQuatInOutQuint<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const time =
          t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatInOutQuintGPU,
      loop,
      methodName: "slerpQuatInOutQuint",
    };
  }

  static slerpQuatOutElastic<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const p = 0.3;
        const time = pow(2, -10 * t) * sin(((t - p / 4) * (2 * PI)) / p) + 1;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatOutElasticGPU,
      loop,
      methodName: "slerpQuatOutElastic",
    };
  }

  static slerpQuatBackIn<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const a = 1.05;
        const time = t * t * t - t * a * sin(t * PI);
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatBackInGPU,
      loop,
      methodName: "slerpQuatBackIn",
    };
  }

  static slerpQuatBackOut<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const a = 1.7;
        const t1 = t - 1;
        const time = t1 * t1 * ((a + 1) * t1 + a) + 1;
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatBackOutGPU,
      loop,
      methodName: "slerpQuatBackOut",
    };
  }

  static slerpQuatBackInOut<T extends Vec>(
    duration: number,
    delay = 0,
    loop = AutoEasingLoopStyle.NONE
  ): IAutoEasingMethod<T> {
    return {
      uid: uid(),
      cpu: (start: T, end: T, t: number, out?: T) => {
        if (!isVec4(start) || !isVec4(end) || !isVec4(out)) {
          const { vec } = VecMath(end);
          console.warn(
            "SLERP QUAT AutoEasingMethod was specified on a non Vec4/Quaternion type which is invalid. This AutoEasingMethod will ONLY work on tuples that have 4 or more elements."
          );
          return vec(1, 0, 0, 0);
        }
        t = clamp(t, 0, 1);
        const a = 1.7;
        const a1 = a * 1.525;
        const t1 = t / 0.5;
        const t2 = t1 - 2;
        const time =
          t1 < 1
            ? 0.5 * (t1 * t1 * (a1 + 1) * t1 - a1)
            : 0.5 * (t2 * t2 * ((a1 + 1) * t2 + a1) + 2);
        const { slerpQuat, vec } = VecMath(start);
        if (!slerpQuat) return vec(1, 0, 0, 0);
        return slerpQuat(start, end, time, out);
      },
      delay,
      duration,
      gpu: slerpQuatBackInOutGPU,
      loop,
      methodName: "slerpQuatBackInOut",
    };
  }

  /** A uid for the easing method */
  uid = uid();
  /** The easing method for the cpu */
  cpu: IAutoEasingMethod<T>["cpu"];
  /** Time before a delay  */
  delay = 0;
  /** The time in ms is takes to complete the animation */
  duration = 500;
  /** The easing method on the GPU */
  gpu: IAutoEasingMethod<T>["gpu"];
  /** The looping style of the animation */
  loop = AutoEasingLoopStyle.NONE;
  /** Method name of the ease function on the gpu */
  methodName: string;

  constructor(
    cpu: IAutoEasingMethod<T>["cpu"],
    gpu: IAutoEasingMethod<T>["gpu"],
    duration?: number,
    method?: string
  ) {
    this.cpu = cpu;
    this.gpu = gpu;
    this.duration = duration || 500;
    this.methodName = method || "easingMethod";
  }
}
