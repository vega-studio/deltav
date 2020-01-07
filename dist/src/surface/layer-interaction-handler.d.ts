import { IMouseInteraction, ISingleTouchInteraction, ITouchInteraction } from "../event-management/types";
import { Instance } from "../instance-provider/instance";
import { BaseProjection } from "../math/base-projection";
import { IColorPickingData } from "../types";
import { ILayerProps, Layer } from "./layer";
/**
 * This manages mouse gestures broadcast to the layer and handles appropriate actions such as determining
 * how to make the interaction translate to picking events for the layer's instances.
 *
 * Summarized: layer-mouse-events processes and filters events for the Views, this processes those events for the layers
 * and their instances.
 */
export declare class LayerInteractionHandler<T extends Instance, U extends ILayerProps<T>> {
    /** This is the color picking information most recently rendered */
    colorPicking?: IColorPickingData;
    /** This tracks the elements that have the mouse currently over them */
    isMouseOver: Set<T>;
    /** This tracks the elements the mouse was down on */
    isMouseDown: Set<T>;
    /** This is the layer the interaction handler manages events for */
    layer: Layer<T, U>;
    /** Tracks elements that have a touch over them */
    isTouchOver: Map<number, Set<T>>;
    isTouchDown: Map<number, Set<T>>;
    constructor(layer: Layer<T, U>);
    /**
     * Retrieves the color picking instance determined for the procedure.
     */
    getColorPickInstance(): T | null | undefined;
    /**
     * Handles mouse down gestures for a layer within a view
     */
    handleMouseOver(_view: BaseProjection<any>, _interaction: IMouseInteraction): void;
    /**
     * Handles touch down gestures for a layer within a view
     */
    handleTouchOver(_view: BaseProjection<any>, _interaction: ITouchInteraction, _touch: ISingleTouchInteraction): void;
    /**
     * Handles mouse down gestures for a layer within a view
     */
    handleMouseDown(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    /**
     * Handles touch events for instances for layers
     */
    handleTouchDown(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    /**
     * Handles mouse out events for a layer within the view
     */
    handleMouseOut(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    /**
     * Handles touch events that have been dragged off of a view
     */
    handleTouchOut(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    /**
     * Handles mouse up gestures for the layer within the provided view
     */
    handleMouseUp(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    /**
     * Handles touch up events that occur over a view
     */
    handleTouchUp(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    /**
     * Mouse move events on the layer will detect when instances have their item newly over or just moved on
     */
    handleMouseMove(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    /**
     * Handles touches that are moving along the screen
     */
    handleTouchMove(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    /**
     * Handles click gestures on the layer within a view
     */
    handleMouseClick(view: BaseProjection<any>, interaction: IMouseInteraction): void;
    /**
     * Handles tap interactions with the view
     */
    handleTap(view: BaseProjection<any>, interaction: ITouchInteraction, touch: ISingleTouchInteraction): void;
    /**
     * Handles drag gestures for the layer within the view
     */
    handleMouseDrag(_view: BaseProjection<any>, _interaction: IMouseInteraction): void;
}
