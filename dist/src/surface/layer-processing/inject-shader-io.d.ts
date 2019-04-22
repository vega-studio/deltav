import { Instance } from "../../instance-provider/instance";
import { ProcessShaderImportResults } from "../../shaders/processing/shader-processor";
import { IInstanceAttribute, IShaderInitialization, IUniformInternal, IVertexAttributeInternal } from "../../types";
import { BaseIOSorting } from "../base-io-sorting";
import { ILayerProps, Layer } from "../layer";
import { BaseIOExpansion } from "./base-io-expansion";
export declare function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(gl: WebGLRenderingContext, layer: Layer<T, U>, shaderIO: IShaderInitialization<T>, ioExpansion: BaseIOExpansion[], sortIO: BaseIOSorting, importResults: ProcessShaderImportResults): {
    instanceAttributes: IInstanceAttribute<Instance>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
