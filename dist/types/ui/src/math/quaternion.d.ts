import { EulerOrder, EulerRotation, type ReadonlyEulerRotation } from "../types.js";
import { Mat3x3, Mat4x4, type ReadonlyMat3x3, type ReadonlyMat4x4 } from "./matrix.js";
import { type ReadonlyVec3Compat, Vec3, Vec4 } from "./vector.js";
/** Expresses a quaternion [scalar, i, j, k] */
export type Quaternion = Vec4;
/** Expresses a readonly quaternion [scalar, i, j, k] */
export type ReadonlyQuaternion = Readonly<Vec4>;
/** Temp Quaternion register. Can be used for intermediate operations */
export declare const QR1: Vec4;
/** Temp Quaternion register. Can be used for intermediate operations */
export declare const QR2: Vec4;
/** Temp Quaternion register. Can be used for intermediate operations */
export declare const QR3: Vec4;
/** Temp Quaternion register. Can be used for intermediate operations */
export declare const QR4: Vec4;
/** Helper index to make index selection more readable if desired */
export declare const QX = 1;
/** Helper index to make index selection more readable if desired */
export declare const QY = 2;
/** Helper index to make index selection more readable if desired */
export declare const QZ = 3;
/** Helper index to make index selection more readable if desired */
export declare const QW = 0;
export declare function clamp(x: number, min: number, max: number): number;
/**
 * Generates a new zero quaternion
 */
export declare function zeroQuat(out?: Quaternion): Quaternion;
/**
 * Adds two quaternions.
 */
export declare function addQuat(q1: ReadonlyQuaternion, q2: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Multiplies two quaternions.
 * Note: Quaternion multiplication is noncommutative.
 */
export declare function multiplyQuat(q1: ReadonlyQuaternion, q2: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Performs quaternion division:
 * q1 / q2 = q1 * q2^-1
 */
export declare function divideQuat(q1: ReadonlyQuaternion, q2: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Calculates the exponentiation of a quaternion
 */
export declare function exponentQuat(q: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Multiplies a quaternion by a scalar.
 */
export declare function scaleQuat(q: ReadonlyQuaternion, scale: number, out?: Quaternion): Quaternion;
/**
 * This provides a sort of "directional" unit quaternion such that:
 * q2 - q1 = diff
 * where
 * diff * q1 = q2
 *
 * The math for this is:
 * diff = q2 * inverse(q1)
 *
 * Optimzied for Unit quats:
 * inverse(q1) = conjugate(q1) / abs(q1)
 * where
 * abs(q1) = 1 for unit quats
 */
export declare function diffUnitQuat(q1: ReadonlyQuaternion, q2: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Computes the conjugate of a quaternion.
 */
export declare function conjugateQuat(q: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Computes the inverse, or reciprocal, of a quaternion.
 */
export declare function inverseQuat(q: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Computes the length of a quaternion: that is, the square root of
 * the product of the quaternion with its conjugate.  Also known as
 * the "norm".
 */
export declare function lengthQuat(q: ReadonlyQuaternion): number;
/**
 * Normalizes a quaternion so its length is equal to 1.  The result of
 * normalizing a zero quaternion is undefined.
 */
export declare function normalizeQuat(q: ReadonlyQuaternion, out?: Quaternion): Quaternion;
/**
 * Provides the real part of the quaternion.
 */
export declare function realQuat(q: ReadonlyQuaternion): number;
/**
 * Provides the vector part of the quaternion.
 */
export declare function imaginaryQuat(q: ReadonlyQuaternion): Vec3;
/**
 * Dot product of two quaternions
 */
export declare function dotQuat(q1: ReadonlyQuaternion, q2: ReadonlyQuaternion): number;
/**
 * Constructs a rotation quaternion from an axis (a normalized
 * Vec3) and an angle (in radians).
 */
export declare function fromEulerAxisAngleToQuat(axis: Vec3, angle: number, out?: Quaternion): Quaternion;
/**
 * This converts a general euler angle of any rotation order into a quaternion
 */
export declare function fromOrderedEulerToQuat(angles: ReadonlyVec3Compat, order: EulerOrder, out?: Quaternion): Quaternion;
/**
 * This converts a euler angle of any ordering and turns it into an euler of XYZ
 * orientation which is the expected rotation of most elements in this
 * framework.
 */
export declare function toEulerXYZfromOrderedEuler(euler: ReadonlyVec3Compat, order: EulerOrder, out?: EulerRotation): EulerRotation;
/**
 * Helper method for toEulerQuat
 * TODO: May not need this method anymore?
 */
/**
 * Produces a XYZ Euler angle from the provided Quaternion.
 */
export declare function toEulerFromQuat(q: ReadonlyQuaternion, out?: EulerRotation): Vec3;
/**
 * Converts a quaternion to an ordered Euler angle.
 *
 * NOTE: It is best to convert to XYZ ordering if using with this framework's 3D
 * system, or simply use toEulerFromQuat if this is desired. Only use this if
 * you specifically need an Euler angle for a known purpose.
 */
export declare function toOrderedEulerFromQuat(q: ReadonlyQuaternion, order: EulerOrder, out?: Vec3): EulerRotation;
export declare function toOrderedEulerFromQuat2(quat: ReadonlyQuaternion, order: EulerOrder, out?: Vec3): void;
/**
 * Extracts the angle part, in radians, of a rotation quaternion.
 */
export declare function angleQuat(quat: ReadonlyQuaternion): number;
/**
 * Extracts the axis part, as a Vec3, of a rotation quaternion.
 */
export declare function axisQuat(quat: ReadonlyQuaternion): Vec3;
/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'models' perspective where the model orients itself to match
 * the orientation.
 */
export declare function matrix3x3FromUnitQuatModel(q: ReadonlyQuaternion, m?: Mat3x3): Mat3x3;
/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'models' perspective where the model orients itself to match
 * the orientation.
 */
export declare function matrix4x4FromUnitQuatModel(q: ReadonlyQuaternion, m?: Mat4x4): Mat4x4;
/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'views' perspective where the world orients to match the view.
 */
export declare function matrix3x3FromUnitQuatView(q: ReadonlyQuaternion, m?: Mat3x3): Mat3x3;
/**
 * Produces a transform matrix from a returned unit quaternion. This is a matrix
 * that is from a 'views' perspective where the world orients to match the view.
 */
export declare function matrix4x4FromUnitQuatView(q: ReadonlyQuaternion, m?: Mat4x4): Mat4x4;
/**
 * Converts Euler angles [roll(X), pitch(Y), yaw(Z)]
 */
export declare function eulerToQuat(angles: ReadonlyEulerRotation, out?: Quaternion): Quaternion;
/**
 * This produces a quaternion that creates an orientation that will look in the
 * direction specified.
 */
export declare function lookAtQuat(forward: ReadonlyVec3Compat, up: ReadonlyVec3Compat, q?: Quaternion): Quaternion;
export declare function matrix3x3ToQuaternion(mat: ReadonlyMat3x3, q?: Quaternion): Quaternion;
export declare function matrix4x4ToQuaternion(mat: ReadonlyMat4x4, q?: Quaternion): Quaternion;
/**
 * This decomposes the rotational component of a matrix into a quaternion.
 * You must provide the scale magnitudes of the matrix for the operation to
 * work. This means getting:
 * sx = length4(row0);
 * sy = length4(row1);
 * sz = length4(row2);
 */
export declare function decomposeRotation(mat: ReadonlyMat4x4, sx: number, sy: number, sz: number, q?: Quaternion): Vec4;
export declare function lookAtMatrix(forward: ReadonlyVec3Compat, up: ReadonlyVec3Compat, m?: Mat4x4): Mat4x4;
/**
 * Rotates a vector using some nice tricks with a quaternion's value.
 */
export declare function rotateVectorByUnitQuat(v: ReadonlyVec3Compat, q: ReadonlyQuaternion, out?: Vec3): Vec3;
/**
 * SLERP interpolation between two quaternion orientations. The Quaternions MUST
 * be unit quats for this to be valid. If the quat has gotten out of
 * normalization from precision errors, consider renormalizing the quaternion.
 */
export declare function slerpUnitQuat(from: ReadonlyQuaternion, to: ReadonlyQuaternion, t: number, out?: Quaternion): Quaternion;
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
