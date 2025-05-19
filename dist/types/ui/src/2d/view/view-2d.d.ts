import { Bounds } from "../../math/primitives/bounds.js";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene.js";
import { Camera2D } from "./camera-2d.js";
import { Projection2D } from "./projection-2d.js";
/**
 * Defines the input metrics of a view for a scene.
 */
export interface IView2DProps extends IViewProps {
    /** Redefine the camera applied to this view to ensure it's a 2D camera. */
    camera: Camera2D;
}
/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export declare class View2D<TViewProps extends IView2DProps> extends View<TViewProps> {
    static defaultProps: IView2DProps;
    /** These are the projection methods specific to rendering with this 2D system. */
    projection: Projection2D;
    constructor(scene: LayerScene, options: TViewProps);
    /**
     * This operation makes sure we have the view camera adjusted to the new viewport's needs.
     * For default behavior this ensures that the coordinate system has no distortion or perspective, orthographic,
     * top left as 0,0 with +y axis pointing down.
     */
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    willUpdateProps(newProps: IView2DProps): void;
}
