export * from "./auto-easing-method";
export * from "./base-projection";
export * from "./matrix";
export * from "./quaternion";
export * from "./vector";
export * from "./primitives";
export * from "./ray";
import * as matrix from "./matrix";
import * as quaternion from "./quaternion";
import * as vector from "./vector";
/**
 * This is a convenience lookup to see all of the math methods available for manipulating matrices. All of the methods
 * can be imported directly if you know which method you are looking for. This Just helps you find a method you may not
 * know the name of.
 */
export declare const MatrixMath: typeof matrix;
/**
 * This is a convenience lookup to see all of the math methods available for manipulating vectors. All of the methods
 * can be imported directly if you know which method you are looking for. This Just helps you find a method you may not
 * know the name of.
 */
export declare const VectorMath: typeof vector;
/**
 * This is a convenience lookup to see all of the math methods available for manipulating quaternions. All of the methods
 * can be imported directly if you know which method you are looking for. This Just helps you find a method you may not
 * know the name of.
 */
export declare const QuaternionMath: typeof quaternion;
