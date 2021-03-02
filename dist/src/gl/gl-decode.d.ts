import { GLSettings } from "./gl-settings";
import { GLContext, IExtensions } from "./types";
/**
 * This file contains all method used to decode/encode GLSettings to GL types
 */
/**
 * Decodes a DrawMode to a GL setting
 */
export declare function drawMode(gl: GLContext, mode: GLSettings.Model.DrawMode): number;
/**
 * Decodes the TexelDataType to a GL setting
 */
export declare function texelFormat(gl: GLContext, format: GLSettings.Texture.TexelDataType): number;
/**
 * Decodes the SourcePixelFormat to a GL setting
 */
export declare function inputImageFormat(gl: GLContext, format: GLSettings.Texture.SourcePixelFormat): number;
/**
 * Decodes TextureMagFilter to a GL setting
 */
export declare function magFilter(gl: GLContext, filter: GLSettings.Texture.TextureMagFilter): number;
/**
 * Decodes TextureMinFilter to a GL setting
 */
export declare function minFilter(gl: GLContext, filter: GLSettings.Texture.TextureMinFilter, hasMipMaps: boolean): number;
/**
 * Decodes a ColorBufferFormat to valid color render buffer storage formats
 *
 * Takes in any of the render buffer formats, but will default invalid color
 * buffer formats to RGBA4
 */
export declare function colorBufferFormat(gl: GLContext, format: GLSettings.RenderTarget.ColorBufferFormat | GLSettings.RenderTarget.DepthBufferFormat | GLSettings.RenderTarget.StencilBufferFormat): number;
/**
 * Decodes a DepthBufferFormat to valid color depth buffer storage formats.
 *
 * Takes in any of the render buffer formats, but will default invalid depth
 * buffer formats to DEPTH_COMPONENT16
 */
export declare function depthBufferFormat(gl: GLContext, format: GLSettings.RenderTarget.DepthBufferFormat | GLSettings.RenderTarget.ColorBufferFormat | GLSettings.RenderTarget.StencilBufferFormat): number;
/**
 * Decodes a StencilBufferFormat to valid stencil render buffer storage formats
 *
 * Takes in any of the render buffer formats, but will default invalid stencil
 * buffer formats to STENCIL_INDEX8
 */
export declare function stencilBufferFormat(gl: GLContext, format: GLSettings.RenderTarget.ColorBufferFormat | GLSettings.RenderTarget.DepthBufferFormat | GLSettings.RenderTarget.StencilBufferFormat): number;
/**
 * Decodes Wrapping to a GL setting
 */
export declare function wrapMode(gl: GLContext, mode: GLSettings.Texture.Wrapping): number;
/**
 * Decodes an index to an appropriate color attachment for a frame buffer
 */
export declare function indexToColorAttachment(gl: GLContext, extensions: IExtensions, index: number, isSingleBuffer: boolean, isDrawBufferAttachment: boolean): number;
/**
 * Maps an index to a texture units Enum key to use on a WebGLRenderingContext object
 */
export declare function indexToTextureUnit(gl: GLContext, index: number): number;
/**
 * Maps a texture unit to an index that can be used for a uniform.
 */
export declare function textureUnitToIndex(gl: GLContext, unit: number): number;
