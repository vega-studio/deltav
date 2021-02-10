import { isString } from "util";
import {
  atlasRequest,
  AutoEasingMethod,
  BaseResourceOptions,
  CommonMaterialOptions,
  createAttribute,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  ShaderInjectionTarget,
  Vec2,
  Vec3,
  VertexAttributeSize
} from "../../../../src";
import { CubeInstance } from "./cube-instance";

export interface ICubeLayerProps<TInstance extends CubeInstance>
  extends ILayerProps<TInstance> {
  atlas: string | BaseResourceOptions;
}

/**
 * Layer for rendering simple cube primitives
 */
export class CubeLayer<
  TInstance extends CubeInstance,
  TProps extends ICubeLayerProps<TInstance>
> extends Layer<TInstance, TProps> {
  static defaultProps: ICubeLayerProps<CubeInstance> = {
    atlas: "",
    data: new InstanceProvider<CubeInstance>(),
    key: "",
    materialOptions: CommonMaterialOptions.transparentShapeBlending
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

    const { atlas } = this.props;
    const atlasKey = isString(atlas) ? atlas : atlas.key;

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      fs: require("./cube-layer.fs"),
      instanceAttributes: [
        {
          resource: {
            key: () => atlasKey || "",
            name: "topImage",
            shaderInjection: ShaderInjectionTarget.FRAGMENT
          },
          name: "topUV",
          update: o => {
            o.topTexture;

            if (o.topRequest) {
              // If our texture changed, we need to send a disposal request for
              // the resource that was in use.
              if (o.topTexture !== o.topRequest.source) {
                delete o.topRequest.texture;
                o.topRequest.disposeResource = true;
                this.resource.request(this, o, o.topRequest);

                o.topRequest = atlasRequest({
                  key: atlasKey,
                  source: o.topTexture
                });
              }
            } else {
              o.topRequest = atlasRequest({
                key: atlasKey,
                source: o.topTexture
              });
            }

            return this.resource.request(this, o, o.topRequest);
          }
        },
        {
          resource: {
            key: () => atlasKey || "",
            name: "sideImage",
            shaderInjection: ShaderInjectionTarget.FRAGMENT
          },
          name: "sideUV",
          update: o => {
            o.sideTexture;

            if (o.sideRequest) {
              // If our texture changed, we need to send a disposal request for
              // the resource that was in use.
              if (o.sideTexture !== o.sideRequest.source) {
                delete o.sideRequest.texture;
                o.sideRequest.disposeResource = true;
                this.resource.request(this, o, o.sideRequest);

                o.sideRequest = atlasRequest({
                  key: atlasKey,
                  source: o.sideTexture
                });
              }
            } else {
              o.sideRequest = atlasRequest({
                key: atlasKey,
                source: o.sideTexture
              });
            }

            return this.resource.request(this, o, o.sideRequest);
          }
        },
        createAttribute({
          name: "s",
          size: InstanceAttributeSize.THREE,
          update: o => o.scale
        }),
        createAttribute({
          easing: AutoEasingMethod.slerpQuatInOutCubic(1000),
          name: "r",
          size: InstanceAttributeSize.FOUR,
          update: o => o.rotation
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(1000),
          name: "t",
          size: InstanceAttributeSize.THREE,
          update: o => o.position
        }),
        createAttribute({
          name: "size",
          size: InstanceAttributeSize.THREE,
          update: o => o.size
        })
      ],
      uniforms: [],
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
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.CCW
    });
  }
}
