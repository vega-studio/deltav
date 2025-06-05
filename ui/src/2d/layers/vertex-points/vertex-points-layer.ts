import { InstanceProvider } from "../../../../index.js";
import { Instance2D } from "../../../3d/scene-graph/instance-2d.js";
import {
  CommonMaterialOptions,
  GLSettings,
  type ILayer2DProps,
  InstanceAttributeSize,
  type IRenderTextureResource,
  type IRenderTextureResourceRequest,
  isDefined,
  type IShaderInitialization,
  type IUniform,
  Layer2D,
  type OutputFragmentShaderSource,
  ShaderInjectionTarget,
  Texture,
  textureRequest,
  UniformSize,
  VertexAttributeSize,
} from "../../../index.js";

export interface IVertexPointsLayerProps extends ILayer2DProps<Instance2D> {
  /** The number of points that will be rendered. */
  numPoints: number;
  /**
   * The vertex shader to use for the layer. This is standard layer vertex
   */
  vs: string;
  /**
   * The fragment shader to use for the layer. This is standard layer fragment
   * shader declaration so multiple outputs can be specified for MRT.
   */
  fs: OutputFragmentShaderSource;
  /**
   * When this is provided a UV texture coordinate will be provided so a
   * particle can sample it's data from a texture
   */
  dataSourceSize?: {
    /**
     * The name of the vector2 attribute that will store the UV texture
     * coordinate
     */
    attributeName: string;
    /** Width of the data source texture */
    width: number;
    /** Height of the data source texture */
    height: number;
  };
  /**
   * It is common to need texture resources to make these types of processes
   * work. This allows you to specify a map of
   *
   * <name in shader> to <resource key>
   *
   * to make your shaders more robust.
   *
   * Use an array of resources to automatically swap the resources every render
   * in the order the resources are listed in the array.
   */
  resources?: Record<
    string,
    IRenderTextureResource | IRenderTextureResource[] | undefined
  >;
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
 * This layer allows you to specify a vertex buffer with a custmized amount of
 * vertices. You can then use the vertices to be manipulated by a custome vs and
 * fs shader for any purposes.
 *
 * This is intended to make working with float texture based particle systems
 * easier to implement.
 */
export class VertexPointsLayer extends Layer2D<
  Instance2D,
  IVertexPointsLayerProps
> {
  static defaultProps: IVertexPointsLayerProps = {
    data: new InstanceProvider<Instance2D>(),
    key: "",
    numPoints: 10000,
    resources: {},
    vs: `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
        gl_PointSize = 2.0;
      }
    `,
    fs: `
      void main() {
        $\{out: color} = vec4(1.0, 1.0, 1.0, 1.0);
      }
    `,
  };

  initShader(): IShaderInitialization<Instance2D> {
    const { data, resources = {} } = this.props;
    const dummyInstance = new Instance2D({});

    if (data instanceof InstanceProvider) {
      data.add(dummyInstance);
    }

    /**
     * Map all of the buffers to sampler uniforms with the specified keys as the
     * uniform names.
     */
    const resourceUniforms: IUniform[] = Object.keys(resources)
      .map((uniformName) => {
        let textures = resources[uniformName];
        if (!textures) return void 0;
        if (!Array.isArray(textures)) textures = [textures];
        const requests: IRenderTextureResourceRequest[] = [];

        for (let i = 0; i < textures.length; i++) {
          const resource = textures[i];
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
            shaderInjection: ShaderInjectionTarget.ALL,
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
            shaderInjection: ShaderInjectionTarget.ALL,
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
      .flat();

    return {
      drawMode: GLSettings.Model.DrawMode.POINTS,
      vs: this.props.vs,
      fs: this.props.fs,
      instanceAttributes: [
        {
          name: "dummy",
          size: InstanceAttributeSize.ONE,
          update: (_o) => [0],
        },
      ],
      vertexAttributes: [
        {
          name: "vertexIndex",
          size: VertexAttributeSize.ONE,
          update: (vertex: number, _instance?: any) => {
            // For a point cloud, each vertex is a point; just return the position
            // The instance provider should provide the positions
            // This is a placeholder; actual data comes from instances
            return [vertex];
          },
        },
        this.props.dataSourceSize
          ? {
              name: this.props.dataSourceSize.attributeName,
              size: VertexAttributeSize.TWO,
              update: (vertex: number) => {
                const { width, height } = this.props.dataSourceSize ?? {
                  width: 100,
                  height: 100,
                };
                return [
                  (vertex % width) / width,
                  Math.floor(vertex / width) / height,
                ];
              },
            }
          : null,
      ],
      vertexCount: this.props.numPoints,
      uniforms: resourceUniforms ?? [],
    };
  }

  getMaterialOptions() {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
