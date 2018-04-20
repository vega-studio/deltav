import { AbsolutePosition } from '../primitives/absolute-position';
import { Bounds } from '../primitives/bounds';
import { IPoint } from '../primitives/point';
import { Color } from '../types';
import { ChartCamera } from '../util/chart-camera';
import { DataBounds } from '../util/data-bounds';
import { IdentifyByKey, IdentifyByKeyOptions } from '../util/identify-by-key';
import { ViewCamera } from '../util/view-camera';
export declare enum ClearFlags {
    COLOR = 1,
    DEPTH = 2,
    STENCIL = 4,
}
/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewOptions extends IdentifyByKeyOptions {
    /**
     * The background color that gets cleared out for this view. Performance is
     * better if this is left clear. Probably better to draw a colored quad instead.
     * This is just convenient.
     */
    background?: Color;
    /**
     * This is the spatial charting camera that is concerned with offsets and scales.
     * It is often easier to work with camera positioning and settings rather than working
     * with the complex and nuanced viewCamera which works with special transformation matrices
     * to express orientation.
     *
     * If not provided, then this camera will use a default ChartCamera for this camera slot. This
     * will also cause a normal camera handler to be utilized.
     */
    camera?: ChartCamera;
    /**
     * This sets what buffers get cleared by webgl before the view is drawn in it's space.
     */
    clearFlags?: ClearFlags[];
    /**
     * If this is provided, the layer can be rendered with a traditional camera that utilizes
     * matrix transforms to provide orientation/projection for the view.
     *
     * If this is NOT provided, the camera will be a special orthographic camera for 2d spaces
     * with a y-axis of +y points down with (0, 0) at the top left of the viewport.
     */
    viewCamera?: ViewCamera;
    /**
     * This specifies the bounds on the canvas this camera will render to. This let's you render
     * say a little square in the bottom right showing a minimap.
     *
     * If this is not specified, the entire canvas will be the viewport.
     */
    viewport?: AbsolutePosition;
}
/**
 * This defines a view of a scene
 */
export declare class View extends IdentifyByKey {
    static DEFAULT_VIEW_ID: string;
    /** If present, is the cleared color before this view renders */
    background: Color;
    /** Camera that defines the individual components of each axis with simpler concepts */
    camera: ChartCamera;
    /** These are the clear flags set for this view */
    clearFlags: ClearFlags[];
    /**
     * This is the depth of the view. The higher the depth represents which layer is on top.
     * Zero always represents the default view.
     */
    depth: number;
    /** This is set to ensure the projections that happen properly translates the pixel ratio to normal Web coordinates */
    pixelRatio: number;
    /** This is the rendering bounds within screen space */
    screenBounds: Bounds;
    /** Camera that defines the view projection matrix */
    viewCamera: ViewCamera;
    /** The size positioning of the view */
    viewport: AbsolutePosition;
    /** The bounds of the render space on the canvas this view will render on */
    viewBounds: DataBounds<View>;
    constructor(options: IViewOptions);
    screenToPixelSpace(point: IPoint, out?: IPoint): IPoint;
    pixelSpaceToScreen(point: IPoint, out?: IPoint): IPoint;
    screenToView(point: IPoint, out?: IPoint): IPoint;
    viewToScreen(point: IPoint, out?: IPoint): IPoint;
    screenToWorld(point: IPoint, out?: IPoint): IPoint;
    worldToScreen(point: IPoint, out?: IPoint): IPoint;
    viewToWorld(point: IPoint, out?: IPoint): IPoint;
    worldToView(point: IPoint, out?: IPoint): IPoint;
    /**
     * This operation makes sure we have the view camera adjusted to the new viewport's needs.
     * For default behavior this ensures that the coordinate system has no distortion, orthographic,
     * top left as 0,0 with +y axis pointing down.
     */
    fitViewtoViewport(surfaceDimensions: Bounds): void;
}
