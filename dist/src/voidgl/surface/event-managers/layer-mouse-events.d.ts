import { IPoint } from '../../primitives/point';
import { IProjection } from '../../types';
import { EventManager } from '../event-manager';
import { Layer } from '../layer';
import { IDragMetrics, IMouseInteraction, SceneView } from '../mouse-event-manager';
/**
 * This class is an injected event manager for the surface, it specifically handles taking in mouse events intended for view interactions
 * and broadcasts them to the layers that have picking enabled, thus allowing the layers to respond to
 * mouse view locations and broadcast Instance interactions based on the interaction with the View the layer is a part of
 *
 * In Summary: This is an adapter that takes in interactions to the views and injects those events into the layers associated with
 * the views so that the layers can translate the events to gestures.
 */
export declare class LayerMouseEvents extends EventManager {
    /** This is the surface this manager is aiding with broadcasting events to layers */
    sceneViews: SceneView[];
    /** This tracks which views have the mouse over them so we can properly broadcast view is out events */
    isOver: Map<SceneView, boolean>;
    constructor(sceneViews: SceneView[]);
    getSceneViewsUnderMouse(e: IMouseInteraction): SceneView[];
    getMouseByViewId(e: IMouseInteraction): Map<string, IPoint>;
    handleClick(e: IMouseInteraction, button: number): void;
    handleDrag(e: IMouseInteraction, drag: IDragMetrics): void;
    handleInteraction(e: IMouseInteraction, callback: (layer: Layer<any, any, any>, view: IProjection, mouse: IPoint) => void): SceneView[];
    handleMouseDown(e: IMouseInteraction, button: number): void;
    handleMouseUp(e: IMouseInteraction): void;
    handleMouseOver(e: IMouseInteraction): void;
    handleMouseOut(e: IMouseInteraction): void;
    handleMouseMove(e: IMouseInteraction): void;
    handleSceneView(sceneView: SceneView, viewMouseByViewId: Map<string, IPoint>, callback: (layer: Layer<any, any, any>, view: IProjection, mouse: IPoint) => void): void;
}
