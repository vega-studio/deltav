import React from "react";
import { EventManager } from "../../../event-management/event-manager.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IEventManagerJSX } from "./as-event-manager.js";
export interface ISimpleEventHandlerJSX extends Partial<IEventManagerJSX> {
    handlers: Partial<EventManager>;
}
/**
 * Provides a simple event handler to be used by the surface
 */
export declare const SimpleEventHandlerJSX: {
    (props: ISimpleEventHandlerJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
