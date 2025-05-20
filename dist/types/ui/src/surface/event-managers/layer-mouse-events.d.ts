import { QueuedEventHandler } from "../../event-management/queued-event-handler.js";
/**
 * This class is an injected event manager for the surface, it specifically
 * handles taking in mouse events intended for view interactions and broadcasts
 * them to the layers that have picking enabled, thus allowing the layers to
 * respond to mouse view locations and broadcast Instance interactions based on
 * the interaction with the View the layer is a part of.
 *
 * In Summary: This is an adapter that takes in interactions to the views and
 * injects those events into the layers associated with the views so that the
 * layers can translate the events to gestures.
 */
export declare class LayerMouseEvents extends QueuedEventHandler {
    /** This tracks which views have the mouse over them so we can properly broadcast view is out events */
    private isOver;
    /** This tracks which views have touches over them */
    private isTouchOver;
    /** This is the surface this manager is aiding with broadcasting events to layers */
    private get scenes();
    /**
     * This promise waits for the render to complete. Color picking has a
     * complicated process of needing an event to determine which colors to pick
     * from a view resource. The event needs to provide information for processing
     * colors, then the colors need to be processed, then the processed
     * information needs to be used in the same event flow to the Layer handlers.
     *
     * In addition to this: we want to allow for pipeline controlled processing of
     * the colors!
     *
     * So, this new event management solves all of these problems: We dequeue
     * events before render. We process the color picking position, then we wait
     * for rendering to complete so commands can run, then we continue with the
     * broadcast post render.
     */
    private willRenderResolver?;
    private didRenderResolver?;
    constructor();
    /**
     * This enables picking for the surface.
     */
    private enablePicking;
    /**
     * We want to dequeue the events after a render has taken place.
     */
    willRender(): void;
    /**
     * After rendering has completed, we release all handlers waiting for
     * completion.
     */
    didRender(): Promise<void>;
    private getSceneViewsUnderMouse;
    private handleInteraction;
    private handleView;
}
