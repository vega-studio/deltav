import { Instance } from '../instance-provider/instance';
import { IShaderInitialization, IShaderIOExtension } from '../types';
import { shaderTemplate } from './shader-templating';

export function extendShader<T extends Instance>(
  shaderIO: IShaderInitialization<T>,
  extend: IShaderIOExtension<T>
): IShaderInitialization<T> {
  const extendedShaders = {
    vs: shaderIO.vs,
    fs: shaderIO.fs,
  };

  if (extend.vs) {
    extendedShaders.vs = shaderTemplate({
      options: {},
      required: {
        name: 'Shader Extension',
        values: [],
      },
      shader: shaderIO.vs,

      // We do not want to remove any template macros that do not deal with extension
      onToken: token => `$\{${token}}`,

      onMain(body: string | null) {
        if (body === null) {
          console.warn(
            'Could not extend the shader as the void main method could not be determined'
          );
          return '';
        }

        if (!extend.vs) return body;

        return {
          header: extend.vs.header || '',
          main: extend.vs.main
            ? `${extend.vs.main.pre || ''}\n${body}\n${extend.vs.main.post ||
                ''}`
            : body,
        };
      },
    }).shader;
  }

  if (extend.fs) {
    extendedShaders.fs = shaderTemplate({
      options: {},
      required: {
        name: 'Shader Extension',
        values: [],
      },
      shader: shaderIO.fs,

      // We do not want to remove any template macros that do not deal with extension
      onToken: token => `$\{${token}}`,

      onMain(body: string | null) {
        if (body === null) {
          console.warn(
            'Could not extend the shader as the void main method could not be determined'
          );
          return '';
        }

        if (!extend.fs) return body;

        return {
          header: extend.fs.header || '',
          main: extend.fs.main
            ? `${extend.fs.main.pre || ''}\n${body}\n${extend.fs.main.post ||
                ''}`
            : body,
        };
      },
    }).shader;
  }

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
    vs: extendedShaders.vs,
  };
}
