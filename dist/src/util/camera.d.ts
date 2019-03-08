import { Vec3 } from "src/util/vector";
export declare enum CameraProjectionType {
    PERSPECTIVE = 0,
    ORTHOGRAPHIC = 1
}
export interface ICameraOrthographicOptions {
    type: CameraProjectionType.ORTHOGRAPHIC;
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
}
export interface ICameraPerspectiveOptions {
    type: CameraProjectionType.PERSPECTIVE;
    fov: number;
    width: number;
    height: number;
    near: number;
    far: number;
}
export declare type ICameraOptions = ICameraOrthographicOptions | ICameraPerspectiveOptions;
export interface IOrthoGraphicCamera extends Camera {
    projectionOptions: ICameraOrthographicOptions;
}
export interface IPerspectiveCamera extends Camera {
    projectionOptions: ICameraPerspectiveOptions;
}
export declare function isOrthographic(camera: Camera): camera is IOrthoGraphicCamera;
export declare function isPerspective(camera: Camera): camera is IPerspectiveCamera;
export declare class Camera {
    readonly projectionType: CameraProjectionType;
    readonly projection: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _projection;
    readonly view: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _view;
    readonly needsUpdate: boolean;
    private _needsUpdate;
    position: Vec3;
    private _position;
    scale: Vec3;
    private _scale;
    rotation: Vec3;
    private _rotation;
    projectionOptions: ICameraOptions;
    private _projectionOptions;
    constructor(options: ICameraOptions);
    update(force?: boolean): void;
    updateProjection(): void;
    updateTransform(): void;
}
