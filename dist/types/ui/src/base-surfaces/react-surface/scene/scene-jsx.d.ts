import React from "react";
import { SurfaceJSXType } from "../group-surface-children.js";
import { ISceneBaseJSX } from "./as-scene.js";
export interface ISceneJSX extends Partial<ISceneBaseJSX> {
    /** Supports children. View and Layer. */
    children?: React.ReactNode;
    /**
     * Resource name for debugging mostly. Maps to resource "key" in the deltav
     * resource.
     */
    name: string;
}
/**
 * Provides a Scene to be used by a Surface
 */
export declare const SceneJSX: {
    (props: ISceneJSX): React.JSX.Element | undefined;
    defaultProps: {
        surfaceJSXType: SurfaceJSXType;
    };
};
