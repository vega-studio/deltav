import { Material } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { IInstancingUniform, IUniform, OutputFragmentShader } from "../../types";
import { ILayerProps, Layer } from "../layer";
export declare function generateLayerMaterial<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, vs: string, fs: OutputFragmentShader, layerUniforms: IUniform[], instancingUniforms: IInstancingUniform[]): Material;
