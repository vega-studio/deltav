import { Material } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { IInstancingUniform, IUniform } from "../../types";
import { ILayerProps, Layer } from "../layer";
export declare function generateLayerMaterial<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, vs: string, fs: string, layerUniforms: IUniform[], instancingUniforms: IInstancingUniform[]): Material;
