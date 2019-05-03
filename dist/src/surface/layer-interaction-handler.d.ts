import { Instance } from "../instance-provider/instance";
import { IColorPickingData, IProjection } from "../types";
import { Vec2 } from "../util";
import { ILayerProps, Layer } from "./layer";
export declare class LayerInteractionHandler<T extends Instance, U extends ILayerProps<T>> {
    colorPicking?: IColorPickingData;
    isMouseOver: Set<T>;
    isMouseDown: Set<T>;
    layer: Layer<T, U>;
    constructor(layer: Layer<T, U>);
    getColorPickInstance(): T | null | undefined;
    handleMouseOver(_view: IProjection, _mouse: Vec2): void;
    handleMouseDown(view: IProjection, mouse: Vec2, button: number): void;
    handleMouseOut(view: IProjection, mouse: Vec2): void;
    handleMouseUp(view: IProjection, mouse: Vec2, button: number): void;
    handleMouseMove(view: IProjection, mouse: Vec2): void;
    handleMouseClick(view: IProjection, mouse: Vec2, button: number): void;
    handleMouseDrag(_view: IProjection, _mouse: Vec2): void;
}
