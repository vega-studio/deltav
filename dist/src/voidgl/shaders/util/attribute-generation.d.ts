/**
 * The goal of this file is to take in model attributes and instance attributes specified
 * and inject the proper attributes into the shaders so the implementor of the shader does
 * not worry about syncing attribute and uniform names between the JS
 */
import { Instance } from '../../instance-provider/instance';
import { ILayerProps, Layer } from '../../surface/layer';
import { IInstanceAttribute, IInstancingUniform, IShaders, IUniform, IVertexAttribute } from '../../types';
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
export declare function injectFragments<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaders: IShaders, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<any>[], uniforms: IUniform[]): IInjectionDetails;
