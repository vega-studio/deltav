import { Instance } from '../instance-provider/instance';
import { ILayerProps, IShaderInitialization, Layer } from '../surface/layer';
import { IInstanceAttribute, IUniformInternal, IVertexAttributeInternal } from '../types';
/**
 * This is the primary method that analyzes all shader IO and determines which elements needs to be automatically injected
 * into the shader.
 */
export declare function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaderIO: IShaderInitialization<T>): {
    instanceAttributes: IInstanceAttribute<T>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
