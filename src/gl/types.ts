import { Mat3, Mat4, Vec2, Vec3, Vec4 } from "../util";
import { Texture } from "./texture";

export enum MaterialUniformType {
  /** A single float */
  FLOAT,
  /** A single vec2 */
  VEC2,
  /** A single vec3 */
  VEC3,
  /** A single vec4 */
  VEC4,
  /** An array of vec4s (uniform vec4 name[count] in the shader) */
  VEC4_ARRAY,
  /** A single 3x3 matrix of floats */
  MATRIX3x3,
  /** A single 4x4 matrix of floats */
  MATRIX4x4,
  /** The uniform refers to a texture that should be bound to an active texture unit */
  TEXTURE,
}

/**
 * Special enum analyzing material uniforms
 */
export type MaterialUniformValue<T> =
  T extends MaterialUniformType.FLOAT ? number :
  T extends MaterialUniformType.VEC2 ? Vec2 :
  T extends MaterialUniformType.VEC3 ? Vec3 :
  T extends MaterialUniformType.VEC4 ? Vec4 :
  T extends MaterialUniformType.VEC4_ARRAY ? Vec4[] :
  T extends MaterialUniformType.MATRIX3x3 ? Mat3 :
  T extends MaterialUniformType.MATRIX4x4 ? Mat4 :
  T extends MaterialUniformType.TEXTURE ? Texture :
  number
;

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
    location: WebGLUniformLocation;
  }>;
}

export type GLContext = WebGLRenderingContext | WebGL2RenderingContext;
