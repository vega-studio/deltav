import React from "react";
import { IRenderTextureResource } from "../../../resources/index.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";
export interface ITexturePropsJSX extends Partial<IResourceJSX> {
    /**
     * The identifier for the resource.
     */
    name?: string;
}
/**
 * Props for TextureJSX
 */
type ITextureJSX = ITexturePropsJSX & Omit<IRenderTextureResource, "type" | "key">;
/**
 * Generates a texture Resource that can be used by the name provided.
 */
export declare const TextureJSX: {
    (props: ITextureJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
export {};
