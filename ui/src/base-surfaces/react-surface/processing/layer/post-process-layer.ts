import {
  Color,
  InstanceAttributeSize,
  IShaderInitialization,
  IUniform,
  ShaderInjectionTarget,
  UniformSize,
  VertexAttributeSize,
} from "../../../../types";
import { CommonMaterialOptions, isDefined } from "../../../../util";
import { flatten2D } from "../../../../util/array";
import { GLSettings, Texture } from "../../../../gl";
import { ILayerProps, Layer } from "../../../../surface";
import {
  Instance,
  InstanceProvider,
  makeObservable,
  observable,
} from "../../../../instance-provider";
import { IRenderTextureResource, textureRequest } from "../../../../resources";
import { Vec2 } from "../../../../math";

export class PostProcessInstance extends Instance {
  @observable tint: Color = [1, 1, 1, 1];

  constructor() {
    super();
    makeObservable(this, PostProcessInstance);
  }
}

export interface IPostProcessLayer extends ILayerProps<PostProcessInstance> {
  /** List of resource names and their respective keys to apply  */
  buffers: Record<string, IRenderTextureResource | undefined>;
  /**
   * This is the fragment shader that will handle the operation to perform
   * computations against all of the input shaders.
   */
  fs: string;
  /**
   * Additional uniforms to inject into the program.
   */
  uniforms?: IUniform[] | ((layer: PostProcessLayer) => IUniform[]);
}

/**
 * Use an empty texture as a shim for failed resource manager texture fetch.
 */
const emptyTexture = new Texture({
  data: {
    width: 2,
    height: 2,
    buffer: new Uint8Array(16),
  },
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
    data: new InstanceProvider<PostProcessInstance>(),
    buffers: {},
    baseShaderModules: () => ({ fs: [], vs: [] }),
    fs: "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
  };

  initShader(): IShaderInitialization<PostProcessInstance> {
    const { buffers, fs, data } = this.props;
    const dummyInstance = new PostProcessInstance();
    if (data instanceof InstanceProvider) data.add(dummyInstance);
    this.alwaysDraw = true;

    const vertexToNormal: Vec2[] = [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ];

    const texCoord: Vec2[] = vertexToNormal.map((v) => [
      v[0] === 1 ? 1 : 0,
      v[1] === 1 ? 1 : 0,
    ]);

    /**
     * Map all of the buffers to sampler uniforms with the specified keys as the
     * uniform names.
     */
    const resourceUniforms: IUniform[] = flatten2D<IUniform>(
      Object.keys(buffers)
        .map((uniformName) => {
          const buffer = buffers[uniformName];
          if (!buffer) return void 0;
          const resourceKey = buffer.key;

          const request = textureRequest({
            key: resourceKey,
          });

          return [
            {
              name: uniformName,
              shaderInjection: ShaderInjectionTarget.FRAGMENT,
              size: UniformSize.TEXTURE,
              update: () => {
                this.resource.request(this, dummyInstance, request);
                return request.texture || emptyTexture;
              },
            },
            {
              name: `${uniformName}_size`,
              shaderInjection: ShaderInjectionTarget.FRAGMENT,
              size: UniformSize.TWO,
              update: () => {
                this.props;
                this.resource.request(this, dummyInstance, request);
                const data = (request.texture || emptyTexture).data;
                return [data?.width || 1, data?.height || 1];
              },
            },
          ];
        })
        .filter(isDefined)
    );

    let addUniforms = this.props.uniforms || [];

    if (!Array.isArray(addUniforms)) {
      addUniforms = addUniforms(this);
    }

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLE_STRIP,
      vs: `
        varying vec2 texCoord;

        void main() {
          gl_Position = vec4(vertex, 0.0, 1.0);
          texCoord = tex;
        }
      `,
      fs,
      instanceAttributes: [
        {
          name: "dummy",
          size: InstanceAttributeSize.ONE,
          update: (_o) => [0],
        },
      ],
      uniforms: resourceUniforms.concat(addUniforms),
      vertexAttributes: [
        {
          name: "vertex",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => vertexToNormal[vertex],
        },
        {
          name: "tex",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => texCoord[vertex],
        },
      ],
      vertexCount: 4,
    };
  }

  shouldDrawView(): boolean {
    return true;
  }

  getMaterialOptions() {
    return CommonMaterialOptions.transparentImageBlending.modify({
      depthTest: false,
    });
  }
}
