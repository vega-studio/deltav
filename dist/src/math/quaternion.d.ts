import { EulerOrder, EulerRotation } from "../types";
import { Mat3x3, Mat4x4 } from "./matrix";
import { Vec3, Vec3Compat, Vec4 } from "./vector";
/** Expresses a quaternion [scalar, i, j, k] */
export declare type Quaternion = Vec4;
export declare function clamp(x: number, min: number, max: number): number;
/**
 * Generates a new zero quaternion
 */
export declare function zeroQuat(out?: Quaternion): Quaternion;
/**
 * Adds two quaternions.
 */
export declare function addQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion;
/**
 * Multiplies two quaternions.
 * Note: Quaternion multiplication is noncommutative.
 */
export declare function multiplyQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion;
/**
 * Performs quaternion division:
 * q1 / q2 = q1 * q2^-1
 */
export declare function divideQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion;
/**
 * Calculates the exponentiation of a quaternion
 */
export declare function exponentQuat(q: Quaternion, out?: Quaternion): Quaternion;
/**
 * Multiplies a quaternion by a scalar.
 */
export declare function scaleQuat(q: Quaternion, scale: number, out?: Quaternion): Quaternion;
/**
 * Computes the conjugate of a quaternion.
 */
export declare function conjugateQuat(q: Quaternion, out?: Quaternion): Quaternion;
/**
 * Computes the inverse, or reciprocal, of a quaternion.
 */
export declare function inverseQuat(q: Quaternion, out?: Quaternion): Quaternion;
/**
 * Computes the length of a quaternion: that is, the square root of
 * the product of the quaternion with its conjugate.  Also known as
 * the "norm".
 */
export declare function lengthQuat(q: Quaternion): number;
/**
 * Normalizes a quaternion so its length is equal to 1.  The result of
 * normalizing a zero quaternion is undefined.
 */
export declare function normalizeQuat(q: Quaternion, out?: Quaternion): Quaternion;
/**
 * Provides the real part of the quaternion.
 */
export declare function realQuat(q: Quaternion): number;
/**
 * Provides the vector part of the quaternion.
 */
export declare function imaginaryQuat(q: Quaternion): Vec3;
/**
 * Dot product of two quaternions
 */
export declare function dotQuat(q1: Quaternion, q2: Quaternion): number;
/**
 * Constructs a rotation quaternion from an axis (a normalized
 * Vec3) and an angle (in radians).
 */
export declare function fromEulerAxisAngleToQuat(axis: Vec3, angle: number, out?: Quaternion): Quaternion;
/**
 * This converts a general euler angle of any rotation order into a quaternion
 */
export declare function fromOrderedEulerToQuat(angles: Vec3, order: EulerOrder, out?: Quaternion): Quaternion;
/**
 * This converts a euler angle of any ordering and turns it into an euler of XYZ orientation which is the expected
 * rotation of most elements in this framework.
 */
export declare function toEulerXYZfromOrderedEuler(euler: Vec3, order: EulerOrder, out?: EulerRotation): EulerRotation;
/**
 * Helper method for toEulerQuat
 * TODO: May not need this method anymore?
 */
/**
 * Produces a XYZ Euler angle from the provided Quaternion.
 */
export declare function toEulerFromQuat(q: Quaternion, out?: EulerRotation): [number, number, number];
/**
 * Converts a quaternion to an ordered Euler angle.
 *
 * NOTE: It is best to convert to XYZ ordering if using with this framework's 3D system, or simply use toEulerFromQuat
 * if this is desired. Only use this if you specifically need an Euler angle for a known purpose.
 */
export declare function toOrderedEulerFromQuat(q: Quaternion, order: EulerOrder, out?: Vec3): EulerRotation;
export declare function toOrderedEulerFromQuat2(quat: Quaternion, order: EulerOrder, out?: Vec3): void;
/**
 * Extracts the angle part, in radians, of a rotation quaternion.
 */
export declare function angleQuat(quat: Quaternion): number;
/**
 * Extracts the axis part, as a Vec3, of a rotation quaternion.
 */
export declare function axisQuat(quat: Quaternion): Vec3;
/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix that is from a 'models' perspective
 * where the model orients itself to match the orientation.
 */
export declare function matrix4x4FromUnitQuatModel(q: Quaternion, m?: Mat4x4): Mat4x4;
/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix that is from a 'views' perspective
 * where the world orients to match the view.
 */
export declare function matrix4x4FromUnitQuatView(q: Quaternion, m?: Mat4x4): Mat4x4;
/**
 * Converts Euler angles [roll(X), pitch(Y), yaw(Z)]
 */
export declare function eulerToQuat(angles: EulerRotation, out?: Quaternion): Quaternion;
/**
 * This produces a quaternion that creates an orientation that will look in the direction specified.
 */
export declare function lookAtQuat(forward: Vec3Compat, up: Vec3Compat, q?: Quaternion): Quaternion;
export declare function matrix3x3ToQuaternion(mat: Mat3x3, q?: Quaternion): Quaternion;
export declare function matrix4x4ToQuaternion(mat: Mat4x4, q?: Quaternion): Quaternion;
export declare function lookAtMatrix(forward: Vec3Compat, up: Vec3Compat, m?: Mat4x4): Mat4x4;
/**
 * SLERP interpolation between two quaternion orientations. The Quaternions MUST be unit quats for this to be valid.
 * If the quat has gotten out of normalization from precision errors, consider renormalizing the quaternion.
 */
export declare function slerpUnitQuat(from: Quaternion, to: Quaternion, t: number, out?: Quaternion): Quaternion;
/**
 * One basis quaternion
 */
export declare function oneQuat(): Quaternion;
/**
 * i basis quaternion
 */
export declare function iQuat(): Quaternion;
/**
 * j basis quaternion
 */
export declare function jQuat(): Quaternion;
/**
 * i basis quaternion
 */
export declare function kQuat(): Quaternion;
