import {
  AutoEasingMethod,
  CommonMaterialOptions,
  createAttribute,
  createMaterialOptions,
  FragmentOutputType,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  normalize3,
  Vec2,
  Vec3,
  VertexAttributeSize,
} from "../../../../src";
import { CubeInstance } from "./cube-instance.js";

export interface ICubeLightingLayerProps<TInstance extends CubeInstance>
  extends ILayerProps<TInstance> {
  fake?: string;
}

function generateTorusGeometry(
  R: number = 1,
  r: number = 0.4,
  segments: number = 64,
  rings: number = 32
): { positions: Vec3[]; normals: Vec3[]; tex: Vec2[] } {
  const positions: Vec3[] = [];
  const normals: Vec3[] = [];
  const tex: Vec2[] = [];

  // Store vertex positions in grid for reuse
  const grid: Vec3[][] = [];
  const uvGrid: Vec2[][] = [];
  const normalGrid: Vec3[][] = [];

  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * 2 * Math.PI;
    grid[i] = [];
    uvGrid[i] = [];
    normalGrid[i] = [];
    for (let j = 0; j <= rings; j++) {
      const v = (j / rings) * 2 * Math.PI;
      const x = (R + r * Math.cos(v)) * Math.cos(u);
      const y = (R + r * Math.cos(v)) * Math.sin(u);
      const z = r * Math.sin(v);

      // Smooth normal: direction from torus center ring to point
      const nx = Math.cos(u) * Math.cos(v);
      const ny = Math.sin(u) * Math.cos(v);
      const nz = Math.sin(v);

      grid[i][j] = [x, y, z];
      normalGrid[i][j] = normalize3([nx, ny, nz]);
      uvGrid[i][j] = [i / segments, j / rings];
    }
  }

  // Generate triangles
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < rings; j++) {
      const i0 = i;
      const i1 = i + 1;
      const j0 = j;
      const j1 = j + 1;

      // Quad as two triangles
      const p00 = grid[i0][j0];
      const p10 = grid[i1][j0];
      const p11 = grid[i1][j1];
      const p01 = grid[i0][j1];

      const n00 = normalGrid[i0][j0];
      const n10 = normalGrid[i1][j0];
      const n11 = normalGrid[i1][j1];
      const n01 = normalGrid[i0][j1];

      const uv00 = uvGrid[i0][j0];
      const uv10 = uvGrid[i1][j0];
      const uv11 = uvGrid[i1][j1];
      const uv01 = uvGrid[i0][j1];

      // Triangle 1
      positions.push(p00, p10, p11);
      normals.push(n00, n10, n11);
      tex.push(uv00, uv10, uv11);

      // Triangle 2
      positions.push(p00, p11, p01);
      normals.push(n00, n11, n01);
      tex.push(uv00, uv11, uv01);
    }
  }

  return { positions, normals, tex };
}

/**
 * Layer for rendering simple cube primitives
 */
export class CubeLightingLayer<
  TInstance extends CubeInstance,
  TProps extends ICubeLightingLayerProps<TInstance>,
> extends Layer<TInstance, TProps> {
  static defaultProps: ICubeLightingLayerProps<CubeInstance> = {
    data: new InstanceProvider<CubeInstance>(),
    key: "",
  };

  initShader(): IShaderInitialization<TInstance> | null {
    const { positions, normals, tex } = generateTorusGeometry();

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      vs: `
        $\{import: projection, transform}
        varying vec2 _texCoord;
        varying vec4 _color;
        varying vec4 _glow;
        varying float _depth;
        varying vec3 v_normal;
        varying vec3 v_position;

        void main() {
          vec4 pos = vec4(position * size, 1.0);
          vec4 world = m * pos;
          _texCoord = texCoord;
          _glow = glow;
          _color = color;
          v_normal = (m * vec4(normal, 0.0)).xyz;
          v_position = world.xyz;

          gl_Position = clipSpace(world.xyz);

          float ndcDepth = gl_Position.z / gl_Position.w;
          // _depth = (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - ndcDepth * (cameraFar - cameraNear));
          // _depth /= cameraFar; // normalize to [0, 1]
          _depth = ndcDepth * 0.5 + 0.5;
        }
      `,
      fs: [
        {
          outputType: FragmentOutputType.COLOR,
          source: `
            varying vec2 _texCoord;
            varying vec4 _color;
            varying vec4 _glow;
            varying float _depth;

            void main() {
              $\{out: albedo} = vec4(_color.rgb, 0.5); // Albedo, Roughness=0.5
            }
          `,
        },
        {
          outputType: FragmentOutputType.MOMENTS,
          source: `
            void main() {
              vec2 moments;
              // First moment is the depth itself.
              moments.x = _depth;
              // Compute partial derivatives of depth.
              float dx = dFdx(_depth);
              float dy = dFdy(_depth);
              // Compute second moment over the pixel extents.
              moments.y = _depth * _depth + 0.25 * (dx * dx + dy * dy);
              $\{out: momentsOut} = vec4(moments, 0.0, 1.0);
            }
          `,
        },
        {
          outputType: FragmentOutputType.NORMAL,
          source: `
            varying vec3 v_normal;

            void main() {
              vec3 normalValue = normalize(v_normal);
              $\{out: normal} = vec4(normalValue * 0.5 + 0.5, 1.0); // Normal encoded
            }
          `,
        },
        {
          outputType: FragmentOutputType.POSITION,
          source: `
            varying vec3 v_position;

            void main() {
              $\{out: position} = vec4(v_position, 1.0);
            }
          `,
        },
        {
          outputType: FragmentOutputType.GLOW,
          source: `
            void main() {
              // Only write the front color to the glow filter
              $\{out: glow} = _glow;
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
          name: "size",
          size: InstanceAttributeSize.THREE,
          update: (o) => o.size,
        }),
        createAttribute({
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.color,
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: "glow",
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.glow,
        }),
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => positions[vertex],
        },
        {
          name: "normal",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => normals[vertex],
        },
        {
          name: "texCoord",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => tex[vertex],
        },
      ],
      vertexCount: positions.length,
    };
  }

  override getMaterialOptions() {
    return createMaterialOptions(
      CommonMaterialOptions.transparentShapeBlending,
      {
        culling: GLSettings.Material.CullSide.CW,
      }
    );
  }
}
