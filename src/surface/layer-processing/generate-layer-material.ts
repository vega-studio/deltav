import { Material, MaterialOptions, MaterialUniformType } from "../../gl";
import { Instance } from "../../instance-provider/instance";
import { IInstancingUniform, IUniform, UniformSize } from "../../types";
import { ILayerProps, Layer } from "../layer";

const UNIFORM_SIZE_TO_MATERIAL_TYPE: { [key: number]: MaterialUniformType } = {
  [UniformSize.ONE]: MaterialUniformType.FLOAT,
  [UniformSize.TWO]: MaterialUniformType.VEC2,
  [UniformSize.THREE]: MaterialUniformType.VEC3,
  [UniformSize.FOUR]: MaterialUniformType.VEC4,
  [UniformSize.MATRIX3]: MaterialUniformType.MATRIX3x3,
  [UniformSize.MATRIX4]: MaterialUniformType.MATRIX4x4,
  [UniformSize.ATLAS]: MaterialUniformType.TEXTURE
};

const DEFAULT_UNIFORM_VALUE: { [key: number]: number[] } = {
  [UniformSize.ONE]: [0],
  [UniformSize.TWO]: [0, 0],
  [UniformSize.THREE]: [0, 0, 0],
  [UniformSize.FOUR]: [0, 0, 0, 0],
  [UniformSize.MATRIX3]: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [UniformSize.MATRIX4]: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

function toMaterialUniform(uniform: IUniform) {
  return {
    type: UNIFORM_SIZE_TO_MATERIAL_TYPE[uniform.size],
    value: DEFAULT_UNIFORM_VALUE[uniform.size]
  };
}

export function generateLayerMaterial<
  T extends Instance,
  U extends ILayerProps<T>
>(
  layer: Layer<T, U>,
  vs: string,
  fs: string,
  layerUniforms: IUniform[],
  instancingUniforms: IInstancingUniform[]
): Material {
  // We now need to establish the material for the layer
  const materialParams: MaterialOptions = layer.getMaterialOptions();
  materialParams.vertexShader = vs;
  materialParams.fragmentShader = fs;
  materialParams.name = layer.id;

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
      value: generatedUniform.value
    };
  }

  return new Material(materialParams);
}
