import { Bounds } from "../../primitives/bounds";
import { IViewProps, View } from "../../surface";
import { LayerScene } from "../../surface/layer-scene";
import { Vec2, Vec3 } from "../../util";
export interface IView2DProps extends IViewProps {
}
export declare class View3D<TViewProps extends IView2DProps> extends View<TViewProps> {
    static defaultProps: IView2DProps;
    constructor(scene: LayerScene, options: TViewProps);
    screenToWorld(point: Vec2, out?: Vec3): Vec3;
    worldToScreen(point: Vec3, out?: Vec2): any;
    viewToWorld(point: Vec2, out?: Vec2): [number, number];
    worldToView(point: Vec2, out?: Vec2): [number, number];
    fitViewtoViewport(_surfaceDimensions: Bounds<never>, viewBounds: Bounds<View<IViewProps>>): void;
}
