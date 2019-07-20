import { Transform } from "../3d/scene-graph/transform";
import { Vec3 } from "../math/vector";
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
export declare type ICameraOptions = (ICameraOrthographicOptions | ICameraPerspectiveOptions) & {
    onViewChange?(camera: Camera, viewId: string): void;
};
export interface IOrthoGraphicCamera extends Camera {
    projectionOptions: ICameraOrthographicOptions;
}
export interface IPerspectiveCamera extends Camera {
    projectionOptions: ICameraPerspectiveOptions;
}
export declare function isOrthographic(camera: Camera): camera is IOrthoGraphicCamera;
export declare function isPerspective(camera: Camera): camera is IPerspectiveCamera;
export declare class Camera {
    readonly id: number;
    private _id;
    animationEndTime: number;
    needsViewDrawn: boolean;
    needsBroadcast: boolean;
    viewChangeViewId: string;
    transform: Transform;
    onChange?(camera: Camera, viewId: string): void;
    broadcast(viewId: string): void;
    static makeOrthographic(): Camera;
    static makePerspective(options?: Partial<ICameraPerspectiveOptions>): Camera;
    readonly projectionType: CameraProjectionType;
    readonly projection: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _projection;
    readonly view: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    readonly needsUpdate: boolean;
    private _needsUpdate;
    position: Vec3;
    lookAt(position: Vec3, up: Vec3): void;
    scale: Vec3;
    projectionOptions: ICameraOptions;
    private _projectionOptions;
    readonly viewProjection: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
    private _viewProjection;
    constructor(options: ICameraOptions);
    resolve(): void;
    update(force?: boolean): void;
    updateProjection(): void;
}
