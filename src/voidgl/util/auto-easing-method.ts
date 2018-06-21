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
  /** This is how long the easing method should last */
  duration: number;
  /**
   * An easing method written in shader language that should produce IDENTICAL
   * values to the values of the cpu easing method using the exact same parameters.
   */
  gpu: string;
}

/**
 * The GPU easing method for linear easing
 */
const linearGPU = `
$\{easeMethod} {
  return (end - start) * t + start;
}
`;

/**
 * Class of base AutoEasingMethods as well as helper constructs for making the methods.
 */
export class AutoEasingMethod<T extends InstanceIOValue> implements IAutoEasingMethod<T> {
  /**
   * Autoeasing methods for linear easing
   */
  static linear<T extends Vec>(duration: number) {
    return {
      cpu: (start: T, end: T, t: number) => {
        const { add, scale, subtract } = VecMath(start);
        t = clamp(t, 0, 1);
        return add(scale(subtract(end, start), t), start);
      },
      duration,
      gpu: linearGPU,
    };
  }

  /** The easing method for the cpu */
  cpu: IAutoEasingMethod<T>['cpu'];
  /** The time in ms is takes to complete the animation */
  duration: number = 500;
  /** The easing method on the GPU */
  gpu: IAutoEasingMethod<T>['gpu'];

  constructor(cpu: IAutoEasingMethod<T>['cpu'], gpu: IAutoEasingMethod<T>['gpu'], duration?: number) {
    this.cpu = cpu;
    this.gpu = gpu;
    this.duration = duration || 500;
  }
}
