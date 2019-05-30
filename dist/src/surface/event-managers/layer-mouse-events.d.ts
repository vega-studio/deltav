import { IProjection } from "../../types";
import { Vec2 } from "../../util";
import { EventManager } from "../event-manager";
import { Layer } from "../layer";
import { LayerScene } from "../layer-scene";
import { IDragMetrics, IMouseInteraction } from "../mouse-event-manager";
import { Surface } from "../surface";
import { View } from "../view";
export declare class LayerMouseEvents extends EventManager {
    isOver: Set<View>;
    readonly scenes: LayerScene[];
    surface: Surface;
    constructor(surface: Surface);
    getSceneViewsUnderMouse(e: IMouseInteraction): View[];
    getMouseByViewId(e: IMouseInteraction): Map<string, [number, number]>;
    handleClick(e: IMouseInteraction, button: number): void;
    handleDrag(e: IMouseInteraction, _drag: IDragMetrics): void;
    handleInteraction(e: IMouseInteraction, callback: (layer: Layer<any, any>, view: IProjection, mouse: Vec2) => void): View[];
    handleMouseDown(e: IMouseInteraction, button: number): void;
    handleMouseUp(e: IMouseInteraction, button: number): void;
    handleMouseOver(_e: IMouseInteraction): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleView(view: View, viewMouseByViewId: Map<string, Vec2>, callback: (layer: Layer<any, any>, view: IProjection, mouse: Vec2) => void): void;
    handleWheel(_e: IMouseInteraction): void;
}
