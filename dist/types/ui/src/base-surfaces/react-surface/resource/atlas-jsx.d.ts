import React from "react";
import { IRenderTextureResource } from "../../../resources/index.js";
import { IResourceJSX } from "./as-resource.js";
import { SurfaceJSXType } from "../group-surface-children.js";
export interface IAtlasPropsJSX extends Partial<IResourceJSX> {
    /**
     * Resource name for debugging mostly. Maps to resource "key" in the deltav
     * resource.
     */
    name?: string;
}
/**
 * Props for AtlasJSX
 */
type IAtlasJSX = IAtlasPropsJSX & Omit<IRenderTextureResource, "type" | "key">;
/**
 * Provides a simple event handler to be used by the surface
 */
export declare const AtlasJSX: {
    (props: IAtlasJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
export {};
