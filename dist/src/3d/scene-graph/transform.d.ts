import { Mat4x4, Quaternion, Vec3 } from "../../math";
export declare class Transform {
    readonly changed: boolean;
    private _changed;
    private needsUpdate;
    private hasViewMatrix;
    readonly matrix: Mat4x4;
    private _matrix;
    readonly viewMatrix: Mat4x4;
    private _viewMatrix?;
    rotation: Quaternion;
    private _rotation;
    private rotationMatrix;
    private needsRotationUpdate;
    scale: Vec3;
    private _scale;
    private scaleMatrix;
    private needsScaleUpdate;
    position: Vec3;
    private _translation;
    private translationMatrix;
    private needsTranslationUpdate;
    lookAt(position: Vec3, up: Vec3): void;
    resolve(): void;
    update(): void;
}
export declare const IdentityTransform: Readonly<Transform>;
