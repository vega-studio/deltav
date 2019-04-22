/// <reference types="webgl2" />
import { Mat3x3, Mat4x4, Vec2, Vec3, Vec4 } from "../util";
import { Texture } from "./texture";
export declare enum MaterialUniformType {
    FLOAT = 0,
    VEC2 = 1,
    VEC3 = 2,
    VEC4 = 3,
    VEC4_ARRAY = 4,
    FLOAT_ARRAY = 5,
    MATRIX3x3 = 6,
    MATRIX4x4 = 7,
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
export declare type MaterialUniformValue<T> = T extends MaterialUniformType.FLOAT ? number : T extends MaterialUniformType.VEC2 ? Vec2 : T extends MaterialUniformType.VEC3 ? Vec3 : T extends MaterialUniformType.VEC4 ? Vec4 : T extends MaterialUniformType.VEC4_ARRAY ? Vec4[] : T extends MaterialUniformType.MATRIX3x3 ? Mat3x3 : T extends MaterialUniformType.MATRIX4x4 ? Mat4x4 : T extends MaterialUniformType.TEXTURE ? Texture : T extends MaterialUniformType.FLOAT_ARRAY ? (number[] | Float32Array) : number;
export interface IMaterialUniform<T extends MaterialUniformType> {
    type: T;
    value: MaterialUniformValue<T>;
    gl?: Map<WebGLProgram, {
        location: WebGLUniformLocation;
    }>;
}
export declare type GLContext = WebGLRenderingContext | WebGL2RenderingContext;
export interface IExtensions {
    anisotropicFiltering?: {
        ext: EXT_texture_filter_anisotropic;
        stat: {
            maxAnistropicFilter: number;
        };
    };
    drawBuffers?: WebGL2RenderingContext | WEBGL_draw_buffers;
    instancing?: WebGL2RenderingContext | ANGLE_instanced_arrays;
}
