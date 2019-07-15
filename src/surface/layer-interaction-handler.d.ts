import { IMouseInteraction, ISingleTouchInteraction, ITouchInteraction } from "../event-management/types";
import { Instance } from "../instance-provider/instance";
import { IColorPickingData, IProjection } from "../types";
import { ILayerProps, Layer } from "./layer";
export declare class LayerInteractionHandler<T extends Instance, U extends ILayerProps<T>> {
    colorPicking?: IColorPickingData;
    isMouseOver: Set<T>;
    isMouseDown: Set<T>;
    layer: Layer<T, U>;
    isTouchOver: Map<number, Set<T>>;
    isTouchDown: Map<number, Set<T>>;
    constructor(layer: Layer<T, U>);
    getColorPickInstance(): T | null | undefined;
    handleMouseOver(_view: IProjection, _interaction: IMouseInteraction): void;
    handleTouchOver(_view: IProjection, _interaction: ITouchInteraction, _touch: ISingleTouchInteraction): void;
    handleMouseDown(view: IProjection, interaction: IMouseInteraction): void;
    handleTouchDown(view: IProjection, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseOut(view: IProjection, interaction: IMouseInteraction): void;
    handleTouchOut(view: IProjection, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseUp(view: IProjection, interaction: IMouseInteraction): void;
    handleTouchUp(view: IProjection, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseMove(view: IProjection, interaction: IMouseInteraction): void;
    handleTouchMove(view: IProjection, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseClick(view: IProjection, interaction: IMouseInteraction): void;
    handleTap(view: IProjection, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseDrag(_view: IProjection, _interaction: IMouseInteraction): void;
}
