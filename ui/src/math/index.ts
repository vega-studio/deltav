export * from "./auto-easing-method.js";
export * from "./base-projection.js";
export * from "./matrix.js";
export * from "./quaternion.js";
export * from "./vector.js";
export * from "./primitives";
export * from "./ray.js";
export * from "./plane.js";

import * as matrix from "./matrix.js";
import * as plane from "./plane.js";
import * as quaternion from "./quaternion.js";
import * as ray from "./ray.js";
import * as vector from "./vector.js";

/**
 * This is a convenience lookup to see all of the math methods available for
 * manipulating matrices. All of the methods can be imported directly if you
 * know which method you are looking for. This Just helps you find a method you
 * may not know the name of.
 */
export const MatrixMath = matrix;
/**
 * This is a convenience lookup to see all of the math methods available for
 * manipulating quaternions. All of the methods can be imported directly if you
 * know which method you are looking for. This Just helps you find a method you
 * may not know the name of.
 */
export const QuaternionMath = quaternion;
/**
 * This is a convenience lookup to see all of the math methods available for
 * manipulating rays. All of the methods can be imported directly if you
 * know which method you are looking for. This Just helps you find a method you
 * may not know the name of.
 */
export const RayMath = ray;
/**
 * This is a convenience lookup to see all of the math methods available for
 * manipulating vectors. All of the methods can be imported directly if you know
 * which method you are looking for. This Just helps you find a method you may
 * not know the name of.
 */
export const VectorMath = vector;

/**
 * This is a convenience lookup to see all of the math methods available for
 * manipulating planes. All of the methods can be imported directly if you know
 * which method you are looking for. This Just helps you find a method you may
 * not know the name of.
 */
export const PlaneMath = plane;
