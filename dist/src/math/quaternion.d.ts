import { EulerOrder, EulerRotation } from "../types";
import { Mat3x3, Mat4x4 } from "./matrix";
import { Vec3, Vec3Compat, Vec4 } from "./vector";
export declare type Quaternion = Vec4;
export declare function clamp(x: number, min: number, max: number): number;
export declare function zeroQuat(out?: Quaternion): Quaternion;
export declare function addQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion;
export declare function multiplyQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion;
export declare function divideQuat(q1: Quaternion, q2: Quaternion, out?: Quaternion): Quaternion;
export declare function exponentQuat(q: Quaternion, out?: Quaternion): Quaternion;
export declare function scaleQuat(q: Quaternion, scale: number, out?: Quaternion): Quaternion;
export declare function conjugateQuat(q: Quaternion, out?: Quaternion): Quaternion;
export declare function inverseQuat(q: Quaternion, out?: Quaternion): Quaternion;
export declare function lengthQuat(q: Quaternion): number;
export declare function normalizeQuat(q: Quaternion, out?: Quaternion): Quaternion;
export declare function realQuat(q: Quaternion): number;
export declare function imaginaryQuat(q: Quaternion): Vec3;
export declare function dotQuat(q1: Quaternion, q2: Quaternion): number;
export declare function fromEulerAxisAngleToQuat(axis: Vec3, angle: number, out?: Quaternion): Quaternion;
export declare function fromOrderedEulerToQuat(angles: Vec3, order: EulerOrder, out?: Quaternion): Quaternion;
export declare function toEulerXYZfromOrderedEuler(euler: Vec3, order: EulerOrder, out?: EulerRotation): EulerRotation;
export declare function toEulerFromQuat(q: Quaternion, out?: EulerRotation): [number, number, number];
export declare function toOrderedEulerFromQuat(q: Quaternion, order: EulerOrder, out?: Vec3): Vec3;
export declare function toOrderedEulerFromQuat2(quat: Quaternion, order: EulerOrder, out?: Vec3): void;
export declare function angleQuat(quat: Quaternion): number;
export declare function axisQuat(quat: Quaternion): Vec3;
export declare function matrix4x4FromUnitQuatModel(q: Quaternion, m?: Mat4x4): Mat4x4;
export declare function matrix4x4FromUnitQuatView(q: Quaternion, m?: Mat4x4): Mat4x4;
export declare function eulerToQuat(angles: EulerRotation, out?: Quaternion): Quaternion;
export declare function lookAtQuat(forward: Vec3Compat, up: Vec3Compat, q?: Quaternion): Quaternion;
export declare function matrix3x3ToQuaternion(mat: Mat3x3, q?: Quaternion): Quaternion;
export declare function matrix4x4ToQuaternion(mat: Mat4x4, q?: Quaternion): Quaternion;
export declare function lookAtMatrix(forward: Vec3Compat, up: Vec3Compat, m?: Mat4x4): Mat4x4;
export declare function slerpUnitQuat(from: Quaternion, to: Quaternion, t: number, out?: Quaternion): Quaternion;
export declare function oneQuat(): Quaternion;
export declare function iQuat(): Quaternion;
export declare function jQuat(): Quaternion;
export declare function kQuat(): Quaternion;