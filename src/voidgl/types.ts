import * as Three from 'three';
import { ILayerProps, Layer } from './layer';
import { Instance } from './util/instance';

export type Diff<T extends string, U extends string> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];
export type Omit<T, K extends keyof T> = {[P in Diff<keyof T, K>]: T[P]};
export type ShaderIOValue = [number] | [number, number] | [number, number, number] | [number, number, number, number] | Three.Vector4[] | Float32Array;
export type InstanceIOValue = [number] | [number, number] | [number, number, number] | [number, number, number, number];

export enum InstanceBlockIndex {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

export enum InstanceAttributeSize {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

export enum UniformSize {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  MATRIX3 = 9,
  MATRIX4 = 16,
}

export enum VertexAttributeSize {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

/**
 * This represents a color in the VoidGL system. Ranges are [0 - 1, 0 - 1, 0 - 1, 0 - 1]
 */
export type Color = [number, number, number, number];

/**
 * Represents something with a unique id
 */
export interface Identifiable {
  /** A unique identifier */
  id: string;
}

/**
 * Information provided in mouse events interacting with objects and
 * layers.
 */
export interface IPickInfo<T extends Instance, U extends ILayerProps<T>, V> {
  layer: Layer<T, U, V>;
  object: T;
  objectIndex: T;
  mouse: [number, number];
  world: [number, number];
}

export interface IVertexAttribute {
  /**
   * When initWithBuffer and customFill are not specified, this is was the system will initially
   * load each vertex attribute with.
   */
  defaults?: number[],
  /**
   * When this is specified it will initialize the model's attribute with the data in this buffer.
   */
  initWithBuffer?: Float32Array;
  /**
   * When generating this attribute in the shader this will be the prefix to the attribute:
   * For instance, if you specify 'highp' as the modifier, then the attribute that appears
   * in the shader will be:
   * attribute highp vec3 position;
   */
  qualifier?: string,
  /**
   * This is the name the attribute will be for the model.
   */
  name: string,
  /**
   * This is the number of floats the attribute will consume. For now, we only allow for up
   * to four floats per attribute.
   */
  size: VertexAttributeSize,
  /**
   * This lets you populate the buffer with an automatically called method. This will fire when
   * necessary updates are detected or on initialization.
   */
  update(vertex: number): ShaderIOValue;
}

export interface IVertexAttributeInternal extends IVertexAttribute {
  /** This is the actual attribute generated internally for the ThreeJS interfacing */
  materialAttribute: Three.BufferAttribute;
}

export interface IInstanceAttribute<T> {
  /**
   * This is a block index helping describe the instancing process. It can be any number as
   * the system will sort and organize them for you. This only helps the system detect when
   * you cram too much info into a single block. The tighter you pack your blocks the better
   * your program will perform.
   */
  block: number,
  /**
   * This is the index within the block this attribute will be available. This is automatically
   * populated by the system.
   */
  blockIndex?: InstanceBlockIndex,
  /**
   * This is the name that will be available in your shader for use. This will only be
   * available after the ${attributes} declaration.
   */
  name: string,
  /**
   * When generating this attribute in the shader this will be the prefix to the attribute:
   * For instance, if you specify 'highp' as the modifier, then the attribute that appears
   * in the shader will be:
   * attribute highp vec3 position;
   */
  qualifier?: string,
  /**
   * This is how many floats the instance attribute takes up. Due to how instancing is
   * implemented, we can only take up to 4 floats per variable right now.
   */
  size: InstanceAttributeSize,
  /**
   * This is the accessor that executes when the instance needs updating. Simply return the
   * value that should be populated for this attribute.
   */
  update(instance: T): InstanceIOValue;
}

// For now internal instance attributes are the same
export type IInstanceAttributeInternal<T> = IInstanceAttribute<T>;

export interface IUniform {
  name: string;
  size: UniformSize;
  qualifier?: string;
  update(uniform: IUniform): ShaderIOValue;
}

export interface IUniformInternal extends IUniform {
  /**
   * All layers will have many many ShaderMaterials generated per each instance buffer as a single buffer
   * can only render so many instances. This tracks across all generated ShaderMaterials for each buffer
   * the material uniforms that need to be updated as a Uniform for a layer is dictated as uniform across
   * all instances.
   */
  materialUniforms: Three.IUniform[];
}

/**
 * This is the structure of a uniform generated for the sake of instancing
 */
export interface IInstancingUniform {
  name: string;
  type: 'f' | 'v2' | 'v3' | 'v4' | '4fv' | 'bvec4';
  value: ShaderIOValue;
}

/**
 * Represents a complete shader object set.
 */
export interface IShaders {
  fs: string;
  header?: string;
  vs: string;
}

export type IMaterialOptions = Partial<Omit<Omit<Omit<Three.ShaderMaterialParameters, 'uniforms'>, 'vertexShader'>, 'fragmentShader'>>;
