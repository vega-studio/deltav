import {
  BaseResourceOptions,
  Camera,
  CommonMaterialOptions,
  createAttribute,
  FragmentOutputType,
  GLSettings,
  identity4,
  ILayerProps,
  Instance,
  InstanceAttributeSize,
  InstanceProvider,
  IRenderTextureResourceRequest,
  IShaderInitialization,
  Layer,
  MatrixMath,
  ShaderInjectionTarget,
  Texture,
  textureRequest,
  UniformSize,
  Vec2,
  Vec3,
  VertexAttributeSize
} from "../../../../src";
import { CubeInstance } from "./cube-instance";

export interface ICubeLayerProps<TInstance extends CubeInstance>
  extends ILayerProps<TInstance> {
  shadowMap?: BaseResourceOptions;
  lightCamera?: Camera;
  shadowBias?(): number;
}

/**
 * Layer for rendering simple cube primitives
 */
export class CubeLayer<
  TInstance extends CubeInstance,
  TProps extends ICubeLayerProps<TInstance>
> extends Layer<TInstance, TProps> {
  static defaultProps: ICubeLayerProps<CubeInstance> = {
    data: new InstanceProvider<CubeInstance>(),
    key: "",
    shadowBias: () => 0.005
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
      BLB
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
      down
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
      [0, 1]
    ];

    const { lightCamera, shadowMap } = this.props;
    let shadowMapRequest: IRenderTextureResourceRequest;
    const dummyInstance = new Instance();

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: [
        // No fragment output to speed up Shadow map rendering. This must come
        // first to ensure nothing else is a potential dependent.
        {
          outputType: FragmentOutputType.BLANK,
          source: `
            void main() {
              // DO NOTHING
              $\{out: blank};
            }
          `
        },
        {
          outputType: FragmentOutputType.COLOR,
          source: require("./cube-layer.fs")
        }
      ],
      instanceAttributes: [
        createAttribute({
          name: "m",
          size: InstanceAttributeSize.MAT4X4,
          update: o => o.matrix
        }),
        createAttribute({
          name: "size",
          size: InstanceAttributeSize.THREE,
          update: o => o.size
        }),
        createAttribute({
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        }),
        createAttribute({
          name: "frontColor",
          size: InstanceAttributeSize.FOUR,
          update: o => o.frontColor
        })
      ],
      uniforms: [
        {
          name: "lightViewProj",
          size: UniformSize.MATRIX4,
          update: () => lightCamera?.viewProjection || identity4()
        },
        {
          name: "lightDir",
          size: UniformSize.THREE,
          shaderInjection: ShaderInjectionTarget.FRAGMENT,
          update: () =>
            MatrixMath.transform4(
              lightCamera?.transform.matrix || identity4(),
              [0, 0, 1, 0]
            )
        },
        {
          name: "lightDepth",
          size: UniformSize.TEXTURE,
          shaderInjection: ShaderInjectionTarget.FRAGMENT,
          update: () => {
            if (!shadowMapRequest) {
              shadowMapRequest = textureRequest({
                key: shadowMap?.key || ""
              });
            }

            this.resource.request(this, dummyInstance, shadowMapRequest);
            return shadowMapRequest.texture || Texture.emptyTexture;
          }
        },
        {
          name: "shadowBias",
          size: UniformSize.ONE,
          shaderInjection: ShaderInjectionTarget.FRAGMENT,
          update: () => this.props.shadowBias?.() || 0
        }
      ],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => positions[vertex]
        },
        {
          name: "normal",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => normals[vertex]
        },
        {
          name: "texCoord",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => tex[vertex]
        }
      ],
      vertexCount: 36,
      vs: require("./cube-layer.vs")
    };
  }

  getMaterialOptions() {
    return CommonMaterialOptions.transparentShapeBlending.modify({
      culling: GLSettings.Material.CullSide.CCW
    });
  }
}
