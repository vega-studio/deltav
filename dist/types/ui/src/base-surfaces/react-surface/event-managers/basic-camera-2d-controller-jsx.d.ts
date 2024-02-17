import React from "react";
import { IBasicCamera2DControllerOptions } from "../../../2d/index.js";
import { IEventManagerJSX } from "./as-event-manager.js";
export interface IBasicCamera2DControllerJSX extends Partial<IEventManagerJSX> {
    options: IBasicCamera2DControllerOptions;
}
/**
 * Provides a simple event handler to be used by the surface
 */
export declare const BasicCamera2DControllerJSX: {
    (props: IBasicCamera2DControllerJSX): React.JSX.Element;
    defaultProps: IBasicCamera2DControllerJSX;
};
