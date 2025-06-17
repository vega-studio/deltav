import { GLSettings, Texture } from "../../../../gl";
import {
  Instance,
  InstanceProvider,
  makeObservable,
  observable,
} from "../../../../instance-provider";
import { Vec2 } from "../../../../math";
import {
  IRenderTextureResource,
  type IRenderTextureResourceRequest,
  textureRequest,
} from "../../../../resources";
import { ILayerProps, Layer } from "../../../../surface";
import {
  Color,
  FragmentOutputType,
  InstanceAttributeSize,
  IShaderInitialization,
  IUniform,
  ShaderInjectionTarget,
  UniformSize,
  VertexAttributeSize,
} from "../../../../types.js";
import { CommonMaterialOptions, isDefined } from "../../../../util";
import { flatten2D } from "../../../../util/array.js";

export class PostProcessInstance extends Instance {
  @observable tint: Color = [1, 1, 1, 1];

  constructor() {
    super();
    makeObservable(this, PostProcessInstance);
  }
}

export interface IPostProcessLayer extends ILayerProps<PostProcessInstance> {
  /**
   * The name of the texture coordinate variable used in the shader.
   */
  textureCoordinateName?: string;
  /**
   * List of resource names and their respective keys to apply. Use an array of
   * resources if you want that resource to be swapped every render.
   */
  buffers: Record<
    string,
    IRenderTextureResource | IRenderTextureResource[] | undefined
  >;
  /**
   * This is the fragment shader that will handle the operation to perform
   * computations against all of the input shaders.
   */
  fs: { source: string; outputType: number }[];
  /**
   * Additional uniforms to inject into the program.
   */
  uniforms?: IUniform[] | ((layer: PostProcessLayer) => IUniform[]);
  /**
   * Tells the layer to not redraw on update. Otherwise, The layer will redraw
   * every frame by default.
   */
  preventDraw?: boolean;
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
    fs: [
      {
        outputType: FragmentOutputType.COLOR,
        source: "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);",
      },
    ],
  };

  initShader(): IShaderInitialization<PostProcessInstance> {
    let { buffers, fs, data } = this.props;
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
          let resources = buffers[uniformName];
          if (!resources) return void 0;
          if (!Array.isArray(resources)) resources = [resources];

          const requests: IRenderTextureResourceRequest[] = [];

          for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
            const resourceKey = resource.key;

            requests.push(
              textureRequest({
                key: resourceKey,
              })
            );
          }

          return [
            {
              name: uniformName,
              shaderInjection: ShaderInjectionTarget.FRAGMENT,
              size: UniformSize.TEXTURE,
              update: () => {
                const request =
                  requests.length < 2
                    ? requests[0]
                    : requests[
                        this.surface.frameMetrics.currentFrame % requests.length
                      ];
                this.resource.request(this, dummyInstance, request);
                return request.texture || emptyTexture;
              },
            },
            {
              name: `${uniformName}_size`,
              shaderInjection: ShaderInjectionTarget.FRAGMENT,
              size: UniformSize.TWO,
              update: () => {
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                this.props;
                const request =
                  requests.length < 2
                    ? requests[0]
                    : requests[
                        this.surface.frameMetrics.currentFrame % requests.length
                      ];
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

    if (Array.isArray(fs)) {
      fs = fs.slice(0);
      fs[0].source = `varying vec2 ${
        this.props.textureCoordinateName || "texCoord"
      };
      ${fs[0].source}`;
    } else {
      fs = [
        {
          source: `
            varying vec2 ${this.props.textureCoordinateName || "texCoord"};
            ${fs}
          `,
          outputType: FragmentOutputType.COLOR,
        },
      ];
    }

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLE_STRIP,
      vs: `
        varying vec2 ${this.props.textureCoordinateName || "texCoord"};

        void main() {
          gl_Position = vec4(vertex, 0.0, 1.0);
          ${this.props.textureCoordinateName || "texCoord"} = tex;
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
    return !this.props.preventDraw;
  }

  getMaterialOptions() {
    return CommonMaterialOptions.transparentImageBlending.modify({
      depthTest: false,
    });
  }
}
