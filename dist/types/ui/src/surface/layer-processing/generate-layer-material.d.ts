import { Material } from "../../gl/index.js";
import { Instance } from "../../instance-provider/instance.js";
import { IInstancingUniform, IUniform, OutputFragmentShader } from "../../types.js";
import { ILayerProps, Layer } from "../layer.js";
export declare function generateLayerMaterial<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, vs: string, fs: OutputFragmentShader, layerUniforms: IUniform[], instancingUniforms: IInstancingUniform[]): Material;
