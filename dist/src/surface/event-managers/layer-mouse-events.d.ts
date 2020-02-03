import { SimpleEventHandler } from "../../event-management/simple-event-handler";
import { IEventInteraction, IMouseInteraction, ITouchInteraction } from "../../event-management/types";
import { BaseProjection } from "../../math";
import { Layer } from "../layer";
import { LayerScene } from "../layer-scene";
import { IViewProps, View } from "../view";
/**
 * This class is an injected event manager for the surface, it specifically handles taking in mouse events intended for view interactions
 * and broadcasts them to the layers that have picking enabled, thus allowing the layers to respond to
 * mouse view locations and broadcast Instance interactions based on the interaction with the View the layer is a part of
 *
 * In Summary: This is an adapter that takes in interactions to the views and injects those events into the layers associated with
 * the views so that the layers can translate the events to gestures.
 */
export declare class LayerMouseEvents extends SimpleEventHandler {
    /** This tracks which views have the mouse over them so we can properly broadcast view is out events */
    isOver: Set<View<IViewProps>>;
    /** This tracks which views have touches over them */
    isTouchOver: Map<number, Set<View<IViewProps>>>;
    /** This is the surface this manager is aiding with broadcasting events to layers */
    readonly scenes: LayerScene[];
    constructor();
    getSceneViewsUnderMouse(e: IEventInteraction): View<IViewProps>[];
    handleClick(e: IMouseInteraction): void;
    handleTap(e: ITouchInteraction): void;
    handleDrag(e: IMouseInteraction): void;
    handleMouseDown(e: IMouseInteraction): void;
    handleTouchDown(e: ITouchInteraction): Promise<void>;
    handleMouseUp(e: IMouseInteraction): void;
    handleTouchUp(e: ITouchInteraction): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleTouchOut(e: ITouchInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    /**
     * Touch dragging is essentially touch moving as it's the only way to make a touch glide across the screen
     */
    handleTouchDrag(e: ITouchInteraction): void;
    handleInteraction(e: IEventInteraction, callback: (layer: Layer<any, any>, view: BaseProjection<any>) => void): View<IViewProps>[];
    handleView(view: View<IViewProps>, callback: (layer: Layer<any, any>, view: BaseProjection<any>) => void): void;
}
