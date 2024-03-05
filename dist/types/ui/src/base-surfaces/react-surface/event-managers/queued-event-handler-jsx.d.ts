import React from "react";
import { EventManager } from "../../../event-management/event-manager.js";
import { IEventManagerJSX } from "./as-event-manager.js";
import { SurfaceJSXType } from "../group-surface-children.js";
export interface IQueuedEventHandlerJSX extends Partial<IEventManagerJSX> {
    /** Specified handlers you wish to implement */
    handlers: Partial<EventManager>;
    /**
     * When set to true, ALL events will be stored and broadcasted upon dequeuing
     * of the events. Conversely, when false, only the last event of a given event
     * type will be preserved for broadcast.
     */
    preserveEvents?: boolean;
}
/**
 * Provides a simple event handler to be used by the surface
 */
export declare const QueuedEventHandlerJSX: {
    (props: IQueuedEventHandlerJSX): React.JSX.Element;
    defaultProps: {
        surfaceJSXType: SurfaceJSXType;
    };
};
