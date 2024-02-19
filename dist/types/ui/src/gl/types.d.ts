import { Mat3x3, Mat4x4, Vec2, Vec3, Vec4 } from "../math";
import { Texture } from "./texture";
export declare enum MaterialUniformType {
    /** A single float */
    FLOAT = 0,
    /** A single vec2 */
    VEC2 = 1,
    /** A single vec3 */
    VEC3 = 2,
    /** A single vec4 */
    VEC4 = 3,
    /** An array of vec4s (uniform vec4 name[count] in the shader) */
    VEC4_ARRAY = 4,
    /** An array of floats */
    FLOAT_ARRAY = 5,
    /** A single 3x3 matrix of floats */
    MATRIX3x3 = 6,
    /** A single 4x4 matrix of floats */
    MATRIX4x4 = 7,
    /** The uniform refers to a texture that should be bound to an active texture unit */
    TEXTURE = 8
}
export declare function isUniformVec2(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.VEC2>;
export declare function isUniformVec3(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.VEC3>;
export declare function isUniformVec4(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.VEC4>;
export declare function isUniformVec4Array(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.VEC4_ARRAY>;
export declare function isUniformMat3(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.MATRIX3x3>;
export declare function isUniformMat4(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.MATRIX4x4>;
export declare function isUniformTexture(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.TEXTURE>;
export declare function isUniformFloat(val: IMaterialUniform<MaterialUniformType>): val is IMaterialUniform<MaterialUniformType.FLOAT>;
/**
 * Special enum analyzing material uniforms
 */
export type MaterialUniformValue<T> = T extends MaterialUniformType.FLOAT ? number : T extends MaterialUniformType.VEC2 ? Vec2 : T extends MaterialUniformType.VEC3 ? Vec3 : T extends MaterialUniformType.VEC4 ? Vec4 : T extends MaterialUniformType.VEC4_ARRAY ? Vec4[] : T extends MaterialUniformType.MATRIX3x3 ? Mat3x3 : T extends MaterialUniformType.MATRIX4x4 ? Mat4x4 : T extends MaterialUniformType.TEXTURE ? Texture : T extends MaterialUniformType.FLOAT_ARRAY ? number[] | Float32Array : number;
/**
 * Defines a uniform applied to a material
 */
export interface IMaterialUniform<T extends MaterialUniformType> {
    /** Indictaes which uniform to utilize */
    type: T;
    /** Indicates the value to upload  */
    value: MaterialUniformValue<T>;
    /**
     * State stored in the uniform defining gl specific state.
     * Modifying this outside of the framework is bound to break something.
     */
    gl?: Map<WebGLProgram, {
        /**
         * If this value is set to undefined, then no valid uniform was located
         * to bind to. This is fine, we just need to appropriately react to this
         * to prevent attempts to upload or analyze uneeded data.
         */
        location: WebGLUniformLocation | undefined;
    }>;
}
/** The GL Context which will be either WebGL1 or WebGL2 */
export type GLContext = WebGLRenderingContext | WebGL2RenderingContext;
/**
 * There are now two types of Canvas Element that should be considered. So we harmonize those two into a single type
 * for whenever a canvas of any sort is needed.
 */
export type CanvasElement = HTMLCanvasElement | OffscreenCanvas;
/**
 * Typeguards to see if the canvas is specifically an offscreen canvas or not.
 */
export declare function isOffscreenCanvas(canvas: CanvasElement): canvas is OffscreenCanvas;
/**
 * This defines the extensions the framework works with
 */
export interface IExtensions {
    /** Extension for anisotropic filtering */
    anisotropicFiltering?: {
        ext: EXT_texture_filter_anisotropic;
        stat: {
            maxAnistropicFilter: number;
        };
    };
    /** Extension for MRT (Multiple render targets) */
    drawBuffers?: WebGL2RenderingContext | WEBGL_draw_buffers;
    /** Extension for hardware instancing */
    instancing?: WebGL2RenderingContext | ANGLE_instanced_arrays;
    /** Extension for float texture as a color buffer */
    renderFloatTexture?: WEBGL_color_buffer_float | EXT_color_buffer_float;
    /** Extension for float textures */
    floatTex?: WebGL2RenderingContext | OES_texture_float;
    /** Extension for float textures linear filtering */
    floatTexFilterLinear?: WebGL2RenderingContext | OES_texture_float_linear;
    /** Extension for half float textures */
    halfFloatTex?: WebGL2RenderingContext | OES_texture_half_float;
    /** Extension for half float textures linear filtering */
    halfFloatTexFilterLinear?: WebGL2RenderingContext | OES_texture_half_float_linear;
    /** Extension support for Vertex Array Objects */
    vao?: WebGL2RenderingContext | OES_vertex_array_object;
}
/**
 * These are the state responses for using a material
 */
export declare enum UseMaterialStatus {
    /** The material had an error when being used */
    INVALID = 0,
    /** The material is now in use and ready for draws */
    VALID = 1,
    /**
     * The current render target and the material specified have no matching
     * output types, thus drawing with the provided material will result in
     */
    NO_RENDER_TARGET_MATCHES = 2
}
