import React from "react";
import { IRenderTextureResource } from "../../../resources/index.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";
export interface IFloatTexturePropsJSX extends Partial<IResourceJSX> {
    /**
     * Resource name for debugging mostly. Maps to resource "key" in the deltav
     * resource.
     */
    name?: string;
    /**
     * The number of channels that can carry a unique value. This will be between
     * 1 and 4.
     */
    channels?: 1 | 2 | 3 | 4;
    /**
     * If true, the texture will be forced to use half precision floats. Some
     * hardware only supports half precision floats.
     */
    forceHalfPrecision?: boolean;
    /**
     * The data to apply to the GPU for the image. If no data is to be uploaded to
     * the texture, use width and height object.
     */
    data?: Float32Array;
}
/**
 * Props for TextureJSX
 */
type IFloatTextureJSX = IFloatTexturePropsJSX & Omit<IRenderTextureResource, "type" | "key">;
/**
 * This is aa simple abstraction of the TextureJSX item to create a texture
 * intended for float data which is commonly used for anything that requires
 * higher values and higher precision than simple color data.
 *
 * NOTE: This will automatically set the texture to a float size that is MOST
 * COMPATIBLE with the indicated hardware (will have read AND write support). If
 * you need to force a Texture with specific sizing and you know how it will
 * behave with your intended hardware, use TextureJSX directly.
 */
export declare const FloatTextureJSX: {
    (props: IFloatTextureJSX): React.JSX.Element;
    surfaceJSXType: SurfaceJSXType;
};
export {};
