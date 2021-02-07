/**
 * This file is dedicted to the all important step of processing desired inputs
 * from the layer and coming up with automated generated uniforms and attributes
 * that the shader's will need in order to operate with the conveniences the
 * library offers. This includes things such as injecting camera projection
 * uniforms, resource uniforms, animation adjustments etc etc.
 */
import { Instance } from "../../instance-provider/instance";
import { ILayerProps, Layer } from "../../surface/layer";
import { BaseIOExpansion } from "../../surface/layer-processing/base-io-expansion";
import { IInstanceAttribute, IShaderInitialization, IUniformInternal, IVertexAttributeInternal } from "../../types";
import { BaseIOSorting } from "./base-io-sorting";
import { ProcessShaderImportResults } from "./shader-processor";
/**
 * This is the primary method that analyzes all shader IO and determines which
 * elements needs to be automatically injected into the shader.
 *
 * @param gl The WebGL context this is being utilized on behalf of.
 * @param layer The layer who's ShaderIO we're analyzing and developing.
 * @param shaderIO The initial ShaderIO the layer has provided.
 * @param ioExpansion The list of BaseIOExpansion objects we will use to expand
 *                    and process the layer's initial Shader IO
 * @param sortIO  The methods to sort the IO configurations
 * @param importResults The Shader IO object provided by the layer after it's
 *                      had it's imports analyzed from the provided shader.
 */
export declare function injectShaderIO<T extends Instance, U extends ILayerProps<T>>(gl: WebGLRenderingContext, layer: Layer<T, U>, shaderIO: IShaderInitialization<T>, ioExpansion: BaseIOExpansion[], sortIO: BaseIOSorting, importResults: ProcessShaderImportResults): {
    instanceAttributes: IInstanceAttribute<Instance>[];
    uniforms: IUniformInternal[];
    vertexAttributes: IVertexAttributeInternal[];
};
