import React from "react";
import { IBasicCamera2DControllerOptions } from "../../../2d/index.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IEventManagerJSX } from "./as-event-manager.js";
export interface IBasicCamera2DControllerJSX extends Partial<IEventManagerJSX> {
    /**
     * Initial configuration of the controller. This is only applied on creation
     * of the controller. You will have to remount this component to make changes
     * here.
     */
    config: IBasicCamera2DControllerOptions;
    /**
     * Set to true to disable the controller from being used.
     */
    disabled?: boolean;
    /**
     * Set to true to disable drag panning. While drag panning is disabled, wheel
     * panning will still work if wheelShouldScroll is true.
     */
    disableDragPanning?: boolean;
}
/**
 * Provides a simple event handler to be used by the surface
 */
export declare const BasicCamera2DControllerJSX: {
    (props: IBasicCamera2DControllerJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
