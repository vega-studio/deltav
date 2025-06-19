import {
  AutoEasingMethod,
  CommonMaterialOptions,
  createAttribute,
  FragmentOutputType,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  Vec2,
  Vec3,
  VertexAttributeSize,
} from "../../../../src";
import { CubeInstance } from "./cube-instance.js";

export interface ICubeLayerProps<TInstance extends CubeInstance>
  extends ILayerProps<TInstance> {
  fake?: string;
}

/**
 * Layer for rendering simple cube primitives
 */
export class CubeLayer<
  TInstance extends CubeInstance,
  TProps extends ICubeLayerProps<TInstance>,
> extends Layer<TInstance, TProps> {
  static defaultProps: ICubeLayerProps<CubeInstance> = {
    data: new InstanceProvider<CubeInstance>(),
    key: "",
    materialOptions: CommonMaterialOptions.transparentShapeBlending,
  };

  initShader(): IShaderInitialization<TInstance> | null {
    const FRT: Vec3 = [1, 1, 1];
    const BRT: Vec3 = [1, 1, -1];
    const BRB: Vec3 = [1, -1, -1];
    const FRB: Vec3 = [1, -1, 1];

    const FLT: Vec3 = [-1, 1, 1];
    const BLT: Vec3 = [-1, 1, -1];
    const BLB: Vec3 = [-1, -1, -1];
    const FLB: Vec3 = [-1, -1, 1];

    const positions: Vec3[] = [
      // right
      FRT,
      BRT,
      BRB,
      FRT,
      BRB,
      FRB,
      // front
      FLT,
      FRT,
      FRB,
      FLT,
      FRB,
      FLB,
      // left
      FLT,
      BLB,
      BLT,
      FLT,
      FLB,
      BLB,
      // back
      BLT,
      BRB,
      BRT,
      BLT,
      BLB,
      BRB,
      // up
      FLT,
      BRT,
      FRT,
      FLT,
      BLT,
      BRT,
      // down
      FLB,
      FRB,
      BRB,
      FLB,
      BRB,
      BLB,
    ];

    const right: Vec3 = [1, 0, 0];
    const forward: Vec3 = [0, 0, 1];
    const left: Vec3 = [-1, 0, 0];
    const backward: Vec3 = [0, 0, -1];
    const up: Vec3 = [0, 1, 0];
    const down: Vec3 = [0, -1, 0];

    const normals = [
      right,
      right,
      right,
      right,
      right,
      right,
      forward,
      forward,
      forward,
      forward,
      forward,
      forward,
      left,
      left,
      left,
      left,
      left,
      left,
      backward,
      backward,
      backward,
      backward,
      backward,
      backward,
      up,
      up,
      up,
      up,
      up,
      up,
      down,
      down,
      down,
      down,
      down,
      down,
    ];

    const tex: Vec2[] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1],

      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1],

      [0, 0],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],

      [0, 0],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],

      [0, 0],
      [1, 1],
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],

      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1],
    ];

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      vs: `
        $\{import: projection, transform}
        varying vec2 _texCoord;
        varying vec4 _color;
        varying vec4 _glow;
        varying float _depth;

        void main() {
          vec4 pos = vec4(position * size, 1.0);
          vec4 world = m * pos;
          _texCoord = texCoord;
          _glow = glow;
          _color = color;

          gl_Position = clipSpace(world.xyz);

          float ndcDepth = gl_Position.z / gl_Position.w;
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
              float isBorder = float(_texCoord.x <= 0.05 || _texCoord.x > 0.95 || _texCoord.y < 0.05 || _texCoord.y > 0.95);

              $\{out: color} = mix(
                _color,
                _glow,
                isBorder
              );
            }
          `,
        },
        {
          outputType: FragmentOutputType.GLOW,
          source: `
            void main() {
              // Only write the front color to the glow filter
              $\{out: glow} = mix(
                vec4(0., 0., 0., 1.),
                _glow,
                isBorder
              );
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
      vertexCount: 36,
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.NONE,
    });
  }
}
