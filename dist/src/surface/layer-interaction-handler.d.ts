import { IMouseInteraction, ISingleTouchInteraction, ITouchInteraction } from "../event-management/types";
import { Instance } from "../instance-provider/instance";
import { BaseProjection } from "../math/base-projection";
import { IColorPickingData } from "../types";
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
    handleMouseOver(_view: BaseProjection<any>, _interaction: IMouseInteraction): void;
    handleTouchOver(_view: BaseProjection<any>, _interaction: ITouchInteraction, _touch: ISingleTouchInteraction): void;
    handleMouseDown(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    handleTouchDown(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseOut(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    handleTouchOut(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseUp(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    handleTouchUp(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseMove(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    handleTouchMove(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseClick(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    handleTap(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    handleMouseDrag(_view: BaseProjection<any>, _interaction: IMouseInteraction): void;
}
