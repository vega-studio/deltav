import { Bounds } from "../../math/primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Projection3D } from "./projection-3d";
export interface IView3DProps extends IViewProps {
}
export declare class View3D<TViewProps extends IView3DProps> extends View<TViewProps> {
    static defaultProps: IView3DProps;
    projection: Projection3D;
    constructor(scene: LayerScene, options: TViewProps);
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
    willUpdateProps(newProps: IView3DProps): void;
}
