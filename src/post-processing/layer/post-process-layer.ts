import { GLSettings } from "../../gl";
import { Texture } from "../../gl/texture";
import { Instance, InstanceProvider } from "../../instance-provider";
import { Vec2 } from "../../math/vector";
import {
  IRenderTextureResourceRequest,
  textureRequest
} from "../../resources/texture/render-texture-resource-request";
import { ILayerProps, Layer } from "../../surface";
import {
  IShaderInitialization,
  IUniform,
  ShaderInjectionTarget,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { CommonMaterialOptions } from "../../util";
import { flatten2D } from "../../util/array";

class PostProcessInstance extends Instance {
  request: IRenderTextureResourceRequest;
}

export interface IPostProcessLayer extends ILayerProps<PostProcessInstance> {
  /** List of resource names and their respective keys to apply  */
  buffers: Record<string, string>;
  /**
   * This is the fragment shader that will handle the operation to perform
   * computations against all of the input shaders.
   */
  fs: string;
  /**
   * Additional uniforms to inject into the program.
   */
  uniforms?: IUniform[];
}

/**
 * Use an empty texture as a shim for failed resource manager texture fetch.
 */
const emptyTexture = new Texture({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16)
  }
});

/**
 * This layer takes in several resources and sets up an appropriate geometry and
 * shader IO to allow for an aggregation shader to be specified.
 */
export class PostProcessLayer extends Layer<
  PostProcessInstance,
  IPostProcessLayer
> {
  static defaultProps: IPostProcessLayer = {
    key: "",
    data: new InstanceProvider<PostProcessInstance>([
      new PostProcessInstance({})
    ]),
    buffers: {},
    fs: "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);"
  };

  initShader(): IShaderInitialization<PostProcessInstance> {
    const { buffers, fs } = this.props;
    const dummyInstance = new PostProcessInstance({});

    const vertexToNormal: Vec2[] = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1]
    ];

    const texCoord: Vec2[] = vertexToNormal.map(v => [
      v[0] === 1 ? 1 : 0,
      v[1] === 1 ? 1 : 0
    ]);

    /**
     * Map all of the buffers to sampler uniforms with the specified keys as the
     * uniform names.
     */
    const resourceUniforms: IUniform[] = flatten2D<IUniform>(
      Object.keys(buffers).map(uniformName => {
        const resourceKey = buffers[uniformName];

        const request = textureRequest({
          key: resourceKey
        });

        return [
          {
            name: uniformName,
            shaderInjection: ShaderInjectionTarget.FRAGMENT,
            size: UniformSize.TEXTURE,
            update: () => {
              this.resource.request(this, dummyInstance, request);
              return request.texture || emptyTexture;
            }
          },
          {
            name: `${uniformName}_size`,
            shaderInjection: ShaderInjectionTarget.FRAGMENT,
            size: UniformSize.TWO,
            update: () => {
              this.resource.request(this, dummyInstance, request);
              const data = (request.texture || emptyTexture).data;
              return [data?.width || 1, data?.height || 1];
            }
          }
        ];
      })
    );

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLE_STRIP,
      instanceAttributes: [],
      uniforms: resourceUniforms.concat(this.props.uniforms || []),
      vertexAttributes: [
        {
          name: "vertex",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => vertexToNormal[vertex]
        },
        {
          name: "tex",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => texCoord[vertex]
        }
      ],
      vertexCount: 4,
      vs: require("./post-process-layer.vs"),
      fs
    };
  }

  getMaterialOptions() {
    return CommonMaterialOptions.transparentImageBlending;
  }
}
