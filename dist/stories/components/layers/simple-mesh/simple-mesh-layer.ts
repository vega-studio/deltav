import {
  CommonMaterialOptions,
  createAttribute,
  FragmentOutputType,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  Vec3,
  VertexAttributeSize,
} from "../../../../src";
import { SimpleMeshInstance } from "./simple-mesh-instance.js";

export interface ISimpleMeshLayerProps<TInstance extends SimpleMeshInstance>
  extends ILayerProps<TInstance> {
  /** The mesh vertices (array of Vec3) */
  vertices: Vec3[];
  /** The mesh normals (array of Vec3) */
  normals: Vec3[];
}

/**
 * Layer for rendering a simple mesh with Phong lighting
 */
export class SimpleMeshLayer<
  TInstance extends SimpleMeshInstance,
  TProps extends ISimpleMeshLayerProps<TInstance>,
> extends Layer<TInstance, TProps> {
  static defaultProps: ISimpleMeshLayerProps<SimpleMeshInstance> = {
    data: new InstanceProvider<SimpleMeshInstance>(),
    key: "",
    materialOptions: CommonMaterialOptions.transparentShapeBlending,
    vertices: [],
    normals: [],
  };

  initShader(): IShaderInitialization<TInstance> | null {
    const { vertices, normals } = this.props;
    const vertexCount = vertices.length;

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      vs: `
        ${`$\{import: projection, transform}`}
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec4 vColor;

        void main() {
          vNormal = (m * vec4(normal, 0.0)).xyz;
          vPosition = (m * vec4(position, 1.0)).xyz;
          vColor = color;
          gl_Position = clipSpace(vPosition);
        }
      `,
      fs: [
        {
          outputType: FragmentOutputType.COLOR,
          source: `
            precision highp float;
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec4 vColor;

            // Simple Phong lighting
            void main() {
              vec3 lightDir = normalize(vec3(0.1, 0.5, 1.0));
              vec3 viewDir = normalize(-vPosition);
              vec3 normal = normalize(vNormal);
              float diff = max(dot(normal, lightDir), 0.0);

              // Ambient
              vec3 ambient = vColor.rgb * 0.15;

              vec3 diffuse = vColor.rgb * diff;
              gl_FragColor = vec4(ambient + diffuse, vColor.a);
            }
          `,
        },
      ],
      instanceAttributes: [
        createAttribute({
          name: "m",
          size: InstanceAttributeSize.MAT4X4,
          update: (o) => o.matrix,
        }),
        createAttribute({
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.color,
        }),
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => vertices[vertex],
        },
        {
          name: "normal",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => normals[vertex],
        },
      ],
      vertexCount,
    };
  }

  /**
   * Layer must be rebuilt if the vertices change.
   */
  willUpdateProps(newProps: ISimpleMeshLayerProps<TInstance>): void {
    if (newProps.vertices !== this.props.vertices) {
      this.rebuildLayer();
    }
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.NONE,
    });
  }
}
