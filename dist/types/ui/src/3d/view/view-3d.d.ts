import { Bounds } from "../../math/primitives/bounds.js";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene.js";
import { Projection3D } from "./projection-3d.js";
/**
 * Defines the input metrics of a view for a scene.
 */
export interface IView3DProps extends IViewProps {
    preventCameraAdjustment?: boolean;
}
/**
 * A View renders a perspective of a scene to a given surface or surfaces. The
 * 3D view system assumes a y-axis up system. The view also assumes the camera
 * is located in the middle of the viewport.
 */
export declare class View3D<TViewProps extends IView3DProps> extends View<TViewProps> {
    static defaultProps: IView3DProps;
    projection: Projection3D;
    constructor(scene: LayerScene, options: TViewProps);
    /**
     * This operation makes sure we have the view camera adjusted to the new
     * viewport's needs.
     */
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    willUpdateProps(newProps: IView3DProps): void;
}
