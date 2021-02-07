import { Bounds } from "../../math/primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { ProjectionScreen } from "./projection-screen";
/**
 * Defines the input metrics of a view for a scene.
 */
export interface IViewScreenProps extends IViewProps {
}
/**
 * A View renders a perspective of a scene to a given surface or surfaces.
 */
export declare class ViewScreen<TViewProps extends IViewScreenProps> extends View<TViewProps> {
    static defaultProps: IViewScreenProps;
    /** These are the projection methods specific to rendering with this 2D system. */
    projection: ProjectionScreen;
    constructor(scene: LayerScene, options: TViewProps);
    /**
     * This operation makes sure we have the view camera adjusted to the new viewport's needs.
     * For default behavior this ensures that the coordinate system has no distortion or perspective, orthographic,
     * top left as 0,0 with +y axis pointing down.
     */
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    willUpdateProps(_newProps: IViewScreenProps): void;
}
