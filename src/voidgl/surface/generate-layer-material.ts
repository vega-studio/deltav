import * as Three from 'three';
import { IInstancingUniform, IUniform, UniformSize } from '../types';
import { Instance } from '../util';
import { ILayerProps, Layer } from './layer';

const UNIFORM_SIZE_TO_MATERIAL_TYPE: {[key: number]: string} = {
  [UniformSize.ONE]: 'f',
  [UniformSize.TWO]: 'v2',
  [UniformSize.THREE]: 'v3',
  [UniformSize.FOUR]: 'v4',
  [UniformSize.MATRIX3]: 'Matrix3fv',
  [UniformSize.MATRIX4]: 'Matrix4fv',
};

const DEFAULT_UNIFORM_VALUE: {[key: number]: number[]} = {
  [UniformSize.ONE]: [0],
  [UniformSize.TWO]: [0, 0],
  [UniformSize.THREE]: [0, 0, 0],
  [UniformSize.FOUR]: [0, 0, 0, 0],
  [UniformSize.MATRIX3]: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [UniformSize.MATRIX4]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

function toMaterialUniform(uniform: IUniform) {
  return {
    type: UNIFORM_SIZE_TO_MATERIAL_TYPE[uniform.size],
    value: DEFAULT_UNIFORM_VALUE[uniform.size],
  };
}

export function generateLayerMaterial<T extends Instance, U extends ILayerProps<T>>(layer: Layer<T, U>, vs: string, fs: string, layerUniforms: IUniform[], instancingUniforms: IInstancingUniform[]): Three.RawShaderMaterial {
  // We now need to establish the material for the layer
  const materialParams: Three.ShaderMaterialParameters = layer.getMaterialOptions();
  materialParams.vertexShader = vs;
  materialParams.fragmentShader = fs;

  // We must convert all of the uniforms to actual Three material initialization uniforms
  materialParams.uniforms = {};

  // Convert our non-instancing uniforms to our material uniforms
  for (let i = 0, end = layerUniforms.length; i < end; ++i) {
    const uniform = layerUniforms[i];
    const materialUniform = toMaterialUniform(uniform);
    materialParams.uniforms[uniform.name] = materialUniform;
  }

  // Add in the generated instancing uniforms
  for (let i = 0, end = instancingUniforms.length; i < end; ++i) {
    const generatedUniform = instancingUniforms[i];
    materialParams.uniforms[generatedUniform.name] = {
      type: generatedUniform.type,
      value: generatedUniform.value,
    };
  }

  return new Three.RawShaderMaterial(materialParams);
}
