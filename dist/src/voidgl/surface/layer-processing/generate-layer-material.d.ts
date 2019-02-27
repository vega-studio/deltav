import * as Three from "three";
import { IInstancingUniform, IUniform } from "../../types";
import { Instance } from "../../util";
import { ILayerProps, Layer } from "../layer";
export declare function generateLayerMaterial<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, vs: string, fs: string, layerUniforms: IUniform[], instancingUniforms: IInstancingUniform[]): Three.RawShaderMaterial;
