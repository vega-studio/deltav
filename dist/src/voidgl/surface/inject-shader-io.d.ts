import { IShaderInitialization, Layer } from '../surface/layer';
import { IInstanceAttribute, IUniformInternal, IVertexAttributeInternal } from '../types';
import { Instance } from '../util/instance';
export declare function injectShaderIO<T extends Instance>(layer: Layer<T, any, any>, shaderIO: IShaderInitialization<T>): {
    instanceAttributes: IInstanceAttribute<T>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
