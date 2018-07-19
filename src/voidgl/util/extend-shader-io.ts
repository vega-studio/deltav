import { Instance } from "../instance-provider/instance";
import { extendShader } from "../shaders/util/extend-shader";
import { IShaderInitialization, IShaderIOExtension } from "../types";

export function extendShaderInitialization<T extends Instance>(
  shaderIO: IShaderInitialization<T>,
  extend: IShaderIOExtension<T>
): IShaderInitialization<T> {
  const extendedShaders = extendShader(shaderIO, extend.vs, extend.fs);

  return {
    fs: extendedShaders.fs,
    instanceAttributes: (shaderIO.instanceAttributes || []).concat(
      extend.instanceAttributes || []
    ),
    uniforms: (shaderIO.uniforms || []).concat(extend.uniforms || []),
    vertexAttributes: (shaderIO.vertexAttributes || []).concat(
      extend.vertexAttributes || []
    ),
    vertexCount: shaderIO.vertexCount,
    vs: extendedShaders.vs
  };
}
