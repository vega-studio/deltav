import { Transform } from "../3d/scene-graph/transform.js";
import { Mat4x4 } from "../math/matrix.js";
import { Vec3 } from "../math/vector.js";
export declare enum CameraProjectionType {
    PERSPECTIVE = 0,
    ORTHOGRAPHIC = 1
}
/**
 * Options for generating a camera that has orthographic properties.
 */
export interface ICameraOrthographicOptions {
    /** Forced type requirement, indicates orthographic projection */
    type: CameraProjectionType.ORTHOGRAPHIC;
    /**
     * When this is true, the camera left, right, top, bottom, near, and far
     * will automatically adjust to the view bounds.
     */
    adjustsToView?: boolean;
    /** Left border of the view range */
    left: number;
    /** Right border of the view range */
    right: number;
    /** Top border of the view range */
    top: number;
    /** Bottom border of the view range */
    bottom: number;
    /** Near border of the view range */
    near: number;
    /** Far border of the view range */
    far: number;
}
/**
 * Options for generating a camera that has perspective properties.
 */
export interface ICameraPerspectiveOptions {
    /** Forced type requirement, indicates perspective projection */
    type: CameraProjectionType.PERSPECTIVE;
    /** Field of view in radians */
    fov: number;
    /** Width of the render space */
    width: number;
    /** Height of the render space */
    height: number;
    /** The near clipping plane */
    near: number;
    /** The far clipping plane */
    far: number;
}
/**
 * Base options for camera construction
 */
export type ICameraOptions = (ICameraOrthographicOptions | ICameraPerspectiveOptions) & {
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
/**
 * This class is present to simplify the concepts of Matrix math down to simpler
 * camera concepts. A camera is two things:
 * - An object that can be placed within the world and be a part of a scene
 *   graph
 * - A mathematical structure that defines the viewing
 */
export declare class Camera {
    /**
     * Provide an identifier for the camera to follow the pattern of most
     * everything in this framework.
     */
    get id(): number;
    private _id;
    /**
     * This is the calculated timestamp at which this camera is 'at rest' and will
     * no longer trigger updates
     */
    animationEndTime: number;
    /** The id of the view to be broadcasted for the sake of a change */
    viewChangeViewId: string;
    /** This is the transform that places the camera within world space */
    transform: Transform;
    /** Handler  */
    onChange?(camera: Camera, viewId: string): void;
    /**
     * Performs the broadcast of changes for the camera if the camera needed a
     * broadcast.
     */
    broadcast(viewId: string): void;
    /**
     * Quick generation of a camera with properties. None make any sense and
     * should be set appropriately. ie - View2D handles setting these values
     * correctly for you.
     */
    static makeOrthographic(options?: Partial<ICameraOrthographicOptions>): Camera;
    /**
     * Quick generation of a camera with perspective properties.
     */
    static makePerspective(options?: Partial<ICameraPerspectiveOptions>): Camera;
    /** The expected projection style of the Camera. */
    get projectionType(): CameraProjectionType;
    /** The computed projection of the camera. */
    get projection(): Mat4x4;
    private _projection;
    /** The computed view transform of the camera. */
    get view(): Mat4x4;
    /**
     * Gets the computed inverse of the view matrix.
     */
    get inverseView(): Mat4x4;
    /** Flag indicating the transforms for this camera need updating. */
    get needsUpdate(): boolean;
    private _needsUpdate;
    /** This is the position of the camera within the world. */
    get position(): Vec3;
    set position(val: Vec3);
    /**
     * The camera must always look at a position within the world. This in
     * conjunction with 'roll' defines the orientation of the camera viewing the
     * world.
     */
    lookAt(position: Vec3, up?: Vec3): void;
    /**
     * This is a scale distortion the camera views the world with. A scale of 2
     * along an axis, means the camera will view 2x the amount of the world along
     * that axis (thus having a visual compression if the screen dimensions do not
     * change).
     *
     * This also has the added benefit of quickly and easily swapping axis
     * directions by simply making the scale -1 for any of the axis.
     */
    get scale(): Vec3;
    set scale(val: Vec3);
    /**
     * Options used for making the projection of the camera. Set new options to
     * update the projection. Getting the options returns a copy of the object and
     * is not the internal object itself.
     */
    get projectionOptions(): ICameraOptions;
    set projectionOptions(val: ICameraOptions);
    private _projectionOptions;
    /**
     * Provides the combined view projection matrices. Applies view first then the
     * projection multiply(P, V).
     */
    get viewProjection(): Mat4x4;
    private _viewProjection;
    /**
     * Gets the computed inverse of the view projection matrix. If the view or
     * projection is modified, the inverse will be invalidated and recomputed.
     */
    get inverseViewProjection(): Mat4x4;
    private _inverseViewProjection?;
    constructor(options: ICameraOptions);
    /**
     * Sets projection options with the camera as an orthographic projection.
     */
    setOrthographic(options: Partial<ICameraOrthographicOptions>): void;
    /**
     * Sets projection options with the camera as a perspective projection.
     */
    setPerspective(options: Partial<ICameraPerspectiveOptions>): void;
    /**
     * This marks the camera's changes as resolved and responded to.
     */
    resolve(): void;
    /**
     * Updates the transform matrices associated with this camera.
     */
    update(force?: boolean): void;
    /**
     * This makes the projection tightly fit it's frustum to include the points
     * provided. The points provided are expected to be in WORLD SPACE unelss
     * otherwise noted.
     */
    fitProjectionToPoints(points: Vec3[], pointsAreCameraSpace?: boolean): void;
    /**
     * Takes the current projection options and produces the projection matrix
     * needed to project elements to the screen.
     */
    updateProjection(): void;
}
