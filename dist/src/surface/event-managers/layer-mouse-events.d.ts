import { SimpleEventHandler } from "../../event-management/simple-event-handler";
import { IEventInteraction, IMouseInteraction, ITouchInteraction } from "../../event-management/types";
import { IProjection } from "../../types";
import { Layer } from "../layer";
import { LayerScene } from "../layer-scene";
import { Surface } from "../surface";
import { IViewProps, View } from "../view";
export declare class LayerMouseEvents extends SimpleEventHandler {
    isOver: Set<View<IViewProps>>;
    isTouchOver: Map<number, Set<View<IViewProps>>>;
    readonly scenes: LayerScene[];
    surface: Surface;
    constructor(surface: Surface);
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
    handleTouchDrag(e: ITouchInteraction): void;
    handleInteraction(e: IEventInteraction, callback: (layer: Layer<any, any>, view: IProjection) => void): View<IViewProps>[];
    handleView(view: View<IViewProps>, callback: (layer: Layer<any, any>, view: IProjection) => void): void;
}
