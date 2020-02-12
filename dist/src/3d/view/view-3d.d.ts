import { Bounds } from "../../math/primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Projection3D } from "./projection-3d";
/**
 * Defines the input metrics of a view for a scene.
 */
export interface IView3DProps extends IViewProps {
}
/**
 * A View renders a perspective of a scene to a given surface or surfaces. The 3D view system assumes a y-axis
 * up system. The view also assumes the camera is located in the middle of the viewport.
 */
export declare class View3D<TViewProps extends IView3DProps> extends View<TViewProps> {
    static defaultProps: IView3DProps;
    projection: Projection3D;
    constructor(scene: LayerScene, options: TViewProps);
    /**
     * This operation makes sure we have the view camera adjusted to the new viewport's needs.
     * For default behavior this ensures that the coordinate system has no distortion or perspective, orthographic,
     * top left as 0,0 with +y axis pointing down.
     */
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    willUpdateProps(newProps: IView3DProps): void;
}
