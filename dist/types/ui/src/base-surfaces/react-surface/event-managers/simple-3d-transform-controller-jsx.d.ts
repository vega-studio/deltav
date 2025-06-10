import React from "react";
import { type ISimple3DTransformControllerOptions } from "../../../3d/view/simple-3d-transform-controller.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IEventManagerJSX } from "./as-event-manager.js";
export interface ISimple3DTransformControllerJSX extends Partial<IEventManagerJSX> {
    config: ISimple3DTransformControllerOptions;
}
/**
 * Provides a simple event handler to be used by the surface
 */
export declare const Simple3DTransformControllerJSX: {
    (props: ISimple3DTransformControllerJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
