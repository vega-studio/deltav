import { IPoint } from "../../primitives/point";
import { IProjection } from "../../types";
import { EventManager } from "../event-manager";
import { Layer } from "../layer";
import { LayerSurface } from "../layer-surface";
import { IDragMetrics, IMouseInteraction, SceneView } from "../mouse-event-manager";
export declare class LayerMouseEvents extends EventManager {
    isOver: Map<SceneView, boolean>;
    sceneViews: SceneView[];
    surface: LayerSurface;
    constructor(surface: LayerSurface);
    getSceneViewsUnderMouse(e: IMouseInteraction): SceneView[];
    getMouseByViewId(e: IMouseInteraction): Map<string, IPoint>;
    handleClick(e: IMouseInteraction, button: number): void;
    handleDrag(e: IMouseInteraction, _drag: IDragMetrics): void;
    handleInteraction(e: IMouseInteraction, callback: (layer: Layer<any, any>, view: IProjection, mouse: IPoint) => void): SceneView[];
    handleMouseDown(e: IMouseInteraction, button: number): void;
    handleMouseUp(e: IMouseInteraction, button: number): void;
    handleMouseOver(_e: IMouseInteraction): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleSceneView(sceneView: SceneView, viewMouseByViewId: Map<string, IPoint>, callback: (layer: Layer<any, any>, view: IProjection, mouse: IPoint) => void): void;
    handleWheel(_e: IMouseInteraction): void;
}
