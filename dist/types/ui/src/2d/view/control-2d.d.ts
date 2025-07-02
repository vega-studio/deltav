import { IAutoEasingMethod } from "../../math/auto-easing-method.js";
import { Vec3 } from "../../math/vector.js";
import { Surface } from "../../surface";
import { Camera2D } from "./camera-2d.js";
export interface IControl2DOptions {
    /** The world space offset of elements in the chart */
    offset?: Vec3;
    /** The world space scaling present in the chart */
    scale?: Vec3;
}
/**
 * Controls for 2D world manipulation
 */
export declare class Control2D {
    get id(): number;
    private _id;
    /** The animation set to this camera to animate it's scale and offset */
    animation: IAutoEasingMethod<Vec3>;
    /** This records when the end of the animation for the camera will be completed */
    animationEndTime: number;
    /** The 2d camera to work with */
    camera: Camera2D;
    /** Indicates which time frame the offset was retrieved so it will only broadcast a change event once for that timeframe */
    private offsetBroadcastTime;
    /** Indicates which time frame the scale was retrieved so it will only broadcast a change event once for that timeframe */
    private scaleBroadcastTime;
    /** Represents how much an element should be offset in world space */
    private _offset;
    private startOffset;
    private startOffsetTime;
    private offsetEndTime;
    /** Represents how scaled each axis should be in world space */
    private _scale;
    private startScale;
    private startScaleTime;
    private scaleEndTime;
    /** This is the surface the camera is controlled by */
    surface?: Surface;
    /** When set, this will broadcast any change in the camera that will affect the view range */
    private onViewChange?;
    /** Flag indicating the camera needs to broadcast it's changes */
    private needsBroadcast;
    constructor(camera: Camera2D, options?: IControl2DOptions);
    /**
     * Performs the broadcast of changes for the camera if the camera needed a broadcast.
     */
    broadcast(viewId: string): void;
    /**
     * Adjusts offset to set the middle at the provided location relative to a provided view.
     */
    centerOn(viewId: string, position: Vec3): void;
    /**
     * Retrieves the current frame's time from the surface this camera is managed under.
     */
    private getCurrentTime;
    /**
     * Gets the source offset value
     */
    getOffset(): Vec3;
    /**
     * Gets the source scale value
     */
    getScale(): Vec3;
    /**
     * Retrieves the animated value of the offset of the camera.
     * To get a non-animated version of the offset use getOffset()
     */
    get offset(): Vec3;
    /**
     * Sets the id of this camera
     */
    setId(id: number): void;
    /**
     * Sets the location of the camera by adjusting the offsets to match.
     * Whatever is set for the "animation" property determines the animation.
     */
    setOffset(offset: Vec3): void;
    /**
     * Retrieves the animated scale. If you want straight end scale value, use getScale()
     */
    get scale(): Vec3;
    /**
     * Applies the handler for broadcasting view changes from the camera.
     */
    setViewChangeHandler(handler: Control2D["onViewChange"]): void;
    /**
     * Sets and animates the scale of the camera.
     * Whatever is set for the "animation" property determines the animation.
     */
    setScale(scale: Vec3): void;
    /**
     * Resolves all flags indicating updates needed.
     */
    resolve(): void;
    private updateEndTime;
}
