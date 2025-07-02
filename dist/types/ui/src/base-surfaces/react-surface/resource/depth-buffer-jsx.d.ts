import React from "react";
import type { GLSettings } from "../../../gl/index.js";
import { type IColorBufferResource } from "../../../resources/color-buffer/color-buffer-resource.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";
export interface IDepthBufferPropsJSX extends Partial<IResourceJSX> {
    /**
     * The identifier for the resource.
     */
    name?: string;
}
/**
 * Props for TextureJSX
 */
type IDepthBufferJSX = IDepthBufferPropsJSX & Omit<IColorBufferResource, "type" | "key" | "colorBufferSettings"> & {
    config: Omit<NonNullable<IColorBufferResource["colorBufferSettings"]>, "internalFormat"> & {
        internalFormat: GLSettings.RenderTarget.DepthBufferFormat;
    };
};
/**
 * Generates a Buffer Resource that can be used by the name provided. This is
 * specialized for depth buffers.
 */
export declare const DepthBufferJSX: {
    (props: IDepthBufferJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
export {};
