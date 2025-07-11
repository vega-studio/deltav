import React from "react";
import type { GLSettings } from "../../../gl/index.js";
import { type IColorBufferResource } from "../../../resources/color-buffer/color-buffer-resource.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";
export interface IColorBufferPropsJSX extends Partial<IResourceJSX> {
    /**
     * The identifier for the resource.
     */
    name?: string;
}
/**
 * Props for TextureJSX
 */
type IColorBufferJSX = IColorBufferPropsJSX & Omit<IColorBufferResource, "type" | "key" | "colorBufferSettings"> & {
    config: Omit<NonNullable<IColorBufferResource["colorBufferSettings"]>, "internalFormat"> & {
        internalFormat: GLSettings.RenderTarget.ColorBufferFormat;
    };
};
/**
 * Generates a texture Resource that can be used by the name provided.
 */
export declare const ColorBufferJSX: {
    (props: IColorBufferJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
export {};
