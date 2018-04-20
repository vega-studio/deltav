import * as Three from 'three';
import { IInstancingUniform, IUniform } from '../types';
import { Layer } from './layer';
export declare function generateLayerMaterial(layer: Layer<any, any, any>, vs: string, fs: string, layerUniforms: IUniform[], instancingUniforms: IInstancingUniform[]): Three.RawShaderMaterial;
