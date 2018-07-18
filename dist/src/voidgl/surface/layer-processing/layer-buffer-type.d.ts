import { Instance } from '../../instance-provider/instance';
import { IInstanceAttribute, IVertexAttribute } from '../../types';
import { Layer } from '../layer';
import { Scene } from '../scene';
export declare enum LayerBufferType {
    UNIFORM = 0,
    INSTANCE_ATTRIBUTE = 1,
}
/**
 * This analyzes a layer and determines if it should use a compatibility instancing mode or use hardware
 * instancing.
 */
export declare function getLayerBufferType<T extends Instance>(gl: WebGLRenderingContext, layer: Layer<T, any>, vertexAttributes: IVertexAttribute[], instanceAttributes: IInstanceAttribute<T>[]): LayerBufferType;
/**
 * Builds the proper buffer manager for the provided layer
 */
export declare function makeLayerBufferManager<T extends Instance>(gl: WebGLRenderingContext, layer: Layer<T, any>, scene: Scene): void;
