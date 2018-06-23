/**
 * The goal of this file is to take in model attributes and instance attributes specified
 * and inject the proper attributes into the shaders so the implementor of the shader does
 * not worry about syncing attribute and uniform names between the JS
 */
import { IInstanceAttribute, IInstancingUniform, IShaders, IUniform, IVertexAttribute } from '../../types';
import { Instance } from '../../util';
export interface IInjectionDetails {
    fs: string;
    materialUniforms: IInstancingUniform[];
    maxInstancesPerBuffer: number;
    vs: string;
}
/**
 * This method is the main algorithm for piecing together all of the attributes necessary
 * and injecting them into the shaders.
 *
 * @param shaders
 * @param vertexAttributes
 * @param instanceAttributes
 */
export declare function injectFragments<T extends Instance>(shaders: IShaders, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[], uniforms: IUniform[]): IInjectionDetails;
