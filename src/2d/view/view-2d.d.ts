import { Bounds } from "../../primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Vec2 } from "../../util";
import { Camera2D } from "./camera-2d";
export interface IView2DProps extends IViewProps {
    camera: Camera2D;
}
export declare class View2D<TViewProps extends IView2DProps> extends View<TViewProps> {
    static defaultProps: IView2DProps;
    constructor(scene: LayerScene, options: TViewProps);
    screenToWorld(point: Vec2, out?: Vec2): [number, number];
    worldToScreen(point: Vec2, out?: Vec2): [number, number];
    viewToWorld(point: Vec2, out?: Vec2): [number, number];
    worldToView(point: Vec2, out?: Vec2): [number, number];
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
}
