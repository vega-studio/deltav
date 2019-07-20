import { Bounds } from "../../math/primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Camera2D } from "./camera-2d";
import { Projection2D } from "./projection-2d";
export interface IView2DProps extends IViewProps {
    camera: Camera2D;
}
export declare class View2D<TViewProps extends IView2DProps> extends View<TViewProps> {
    static defaultProps: IView2DProps;
    projection: Projection2D;
    constructor(scene: LayerScene, options: TViewProps);
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    willUpdateProps(newProps: IView2DProps): void;
}
