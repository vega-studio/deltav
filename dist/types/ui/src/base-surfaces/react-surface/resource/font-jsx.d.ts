import React from "react";
import { IFontResourceOptions } from "../../../resources/index.js";
import { IResourceJSX } from "./as-resource.js";
import { SurfaceJSXType } from "../group-surface-children.js";
export interface IFontPropsJSX extends Partial<IResourceJSX> {
    /**
     * Resource name for debugging mostly. Maps to resource "key" in the deltav
     * resource.
     */
    name?: string;
}
/**
 * Props for FontJSX
 */
type IFontJSX = IFontPropsJSX & Omit<IFontResourceOptions, "type" | "key">;
/**
 * Provides a simple event handler to be used by the surface
 */
export declare const FontJSX: {
    (props: IFontJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
export {};
