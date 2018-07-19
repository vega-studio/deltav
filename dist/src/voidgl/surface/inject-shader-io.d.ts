import { ILayerProps, IShaderInitialization, Layer } from "../surface/layer";
import { IInstanceAttribute, IUniformInternal, IVertexAttributeInternal } from "../types";
import { Instance } from "../util/instance";
export declare function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaderIO: IShaderInitialization<T>): {
    instanceAttributes: IInstanceAttribute<T>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
