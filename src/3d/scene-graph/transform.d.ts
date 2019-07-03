import { Mat4x4, Quaternion, Vec3 } from "../../util";
export declare class Transform {
    readonly changed: boolean;
    private _changed;
    private needsUpdate;
    readonly matrix: Mat4x4;
    private _matrix;
    resolve(): void;
    rotation: Quaternion;
    private _rotation;
    private rotationMatrix;
    private needsRotationUpdate;
    scale: Vec3;
    private _scale;
    private scaleMatrix;
    private needsScaleUpdate;
    translation: Vec3;
    private _translation;
    private translationMatrix;
    private needsTranslationUpdate;
    update(): void;
}
