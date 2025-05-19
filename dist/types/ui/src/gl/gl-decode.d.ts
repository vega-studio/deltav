import { GLSettings } from "./gl-settings.js";
import { GLContext, IExtensions } from "./types.js";
/**
 * This file contains all method used to decode/encode GLSettings to GL types
 */
/**
 * Decodes a DrawMode to a GL setting
 */
export declare function drawMode(gl: GLContext, mode: GLSettings.Model.DrawMode): 0 | 1 | 2 | 3 | 4 | 5 | 6;
/**
 * Decodes the TexelDataType to a GL setting
 */
export declare function texelFormat(gl: GLContext, format: GLSettings.Texture.TexelDataType): 34836 | 6408 | 34842 | 6406 | 6402 | 34041 | 6409 | 6410 | 6407 | 33321 | 33325 | 33326 | 33330 | 33323 | 33327 | 33328 | 33336 | 33338 | 33340 | 32849 | 35905 | 36194 | 35898 | 35901 | 34843 | 34837 | 36221 | 32856 | 35907 | 32855 | 32857 | 32854 | 36220 | 33189 | 33190 | 36012 | 36208 | 36209 | 36214 | 36215 | 36226 | 36227 | 36232 | 36233 | 36238 | 36239;
/**
 * Decodes the SourcePixelFormat to a GL setting
 */
export declare function inputImageFormat(gl: GLContext, format: GLSettings.Texture.SourcePixelFormat): 5120 | 5121 | 5122 | 5123 | 5124 | 5125 | 5126 | 32819 | 32820 | 33635;
/**
 * Decodes TextureMagFilter to a GL setting
 */
export declare function magFilter(gl: GLContext, filter: GLSettings.Texture.TextureMagFilter): 9728 | 9729;
/**
 * Decodes TextureMinFilter to a GL setting
 */
export declare function minFilter(gl: GLContext, filter: GLSettings.Texture.TextureMinFilter, hasMipMaps: boolean): 9728 | 9729 | 9987 | 9985 | 9986 | 9984;
/**
 * Decodes a ColorBufferFormat to valid color render buffer storage formats
 *
 * Takes in any of the render buffer formats, but will default invalid color
 * buffer formats to RGBA4
 */
export declare function colorBufferFormat(gl: GLContext, format: GLSettings.RenderTarget.ColorBufferFormat | GLSettings.RenderTarget.DepthBufferFormat | GLSettings.RenderTarget.StencilBufferFormat): 33321 | 33330 | 33323 | 33336 | 33338 | 33340 | 32849 | 36194 | 32856 | 35907 | 32855 | 32857 | 32854 | 36220 | 36208 | 36214 | 36226 | 36232 | 36238 | 33329 | 33332 | 33331 | 33334 | 33333 | 33335 | 33337 | 33339 | 36975;
/**
 * Decodes a DepthBufferFormat to valid color depth buffer storage formats.
 *
 * Takes in any of the render buffer formats, but will default invalid depth
 * buffer formats to DEPTH_COMPONENT16
 */
export declare function depthBufferFormat(gl: GLContext, format: GLSettings.RenderTarget.DepthBufferFormat | GLSettings.RenderTarget.ColorBufferFormat | GLSettings.RenderTarget.StencilBufferFormat): 34041 | 33189 | 33190 | 36012 | 35056 | 36013;
/**
 * Decodes a StencilBufferFormat to valid stencil render buffer storage formats
 *
 * Takes in any of the render buffer formats, but will default invalid stencil
 * buffer formats to STENCIL_INDEX8
 */
export declare function stencilBufferFormat(gl: GLContext, format: GLSettings.RenderTarget.ColorBufferFormat | GLSettings.RenderTarget.DepthBufferFormat | GLSettings.RenderTarget.StencilBufferFormat): 36168;
/**
 * Decodes Wrapping to a GL setting
 */
export declare function wrapMode(gl: GLContext, mode: GLSettings.Texture.Wrapping): 33071 | 33648 | 10497;
/**
 * Decodes an index to an appropriate color attachment for a frame buffer
 */
export declare function indexToColorAttachment(gl: GLContext, extensions: IExtensions, index: number, isSingleBuffer: boolean, isDrawBufferAttachment: boolean): 0 | 36064 | 1029 | 34853 | 34854 | 34855 | 34856 | 34857 | 34858 | 34859 | 34860 | 34861 | 34862 | 34863 | 34864 | 34865 | 34866 | 34867 | 34868 | 36065 | 36066 | 36067 | 36068 | 36069 | 36070 | 36071 | 36072 | 36073 | 36074 | 36075 | 36076 | 36077 | 36078 | 36079;
/**
 * Maps an index to a texture units Enum key to use on a WebGLRenderingContext object
 */
export declare function indexToTextureUnit(gl: GLContext, index: number): number;
/**
 * Maps a texture unit to an index that can be used for a uniform.
 */
export declare function textureUnitToIndex(gl: GLContext, unit: number): number;
