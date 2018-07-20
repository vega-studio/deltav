import { Instance } from "../instance-provider/instance";
import { ILayerProps, Layer } from "../surface/layer";
import { IInstanceAttribute, IShaderInitialization, IUniformInternal, IVertexAttributeInternal } from "../types";
export declare function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, shaderIO: IShaderInitialization<T>): {
    instanceAttributes: IInstanceAttribute<T>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
