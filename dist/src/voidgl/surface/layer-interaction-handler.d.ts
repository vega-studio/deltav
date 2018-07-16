import { IPoint } from "../primitives/point";
import { IProjection } from "../types";
import { Instance } from "../util";
import { ILayerProps, Layer } from "./layer";
export declare class LayerInteractionHandler<T extends Instance, U extends ILayerProps<T>> {
    isMouseOver: Map<T, boolean>;
    isMouseDown: Map<T, boolean>;
    layer: Layer<T, U>;
    constructor(layer: Layer<T, U>);
    handleMouseOver(_view: IProjection, _mouse: IPoint): void;
    handleMouseDown(view: IProjection, mouse: IPoint, button: number): void;
    handleMouseOut(view: IProjection, mouse: IPoint): void;
    handleMouseUp(view: IProjection, mouse: IPoint, button: number): void;
    handleMouseMove(view: IProjection, mouse: IPoint): void;
    handleMouseClick(view: IProjection, mouse: IPoint, button: number): void;
    handleMouseDrag(_view: IProjection, _mouse: IPoint): void;
}
