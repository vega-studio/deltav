import { Instance } from "../../instance-provider/instance";
import { ProcessShaderImportResults } from "../../shaders/processing/shader-processor";
import { IInstanceAttribute, IShaderInitialization, IUniformInternal, IVertexAttributeInternal } from "../../types";
import { ILayerProps, Layer } from "../layer";
export declare function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(gl: WebGLRenderingContext, layer: Layer<T, U>, shaderIO: IShaderInitialization<T>, importResults: ProcessShaderImportResults): {
    instanceAttributes: IInstanceAttribute<Instance>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
