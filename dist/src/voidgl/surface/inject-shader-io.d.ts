/**
 * This file is dedicted to the all important step of processing desired inputs from the layer
 * and coming up with automated generated uniforms and attributes that the shader's will need
 * in order to operate with the conveniences the library offers. This includes things such as
 * injecting camera projection uniforms, resource uniforms, animation adjustments etc etc.
 */
import { IShaderInitialization, Layer } from '../surface/layer';
import { IInstanceAttribute, IUniformInternal, IVertexAttributeInternal } from '../types';
import { Instance } from '../util/instance';
export declare function injectShaderIO<T extends Instance>(layer: Layer<T, any, any>, shaderIO: IShaderInitialization<T>): {
    instanceAttributes: IInstanceAttribute<T>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
