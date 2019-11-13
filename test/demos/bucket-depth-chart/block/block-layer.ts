/*import {
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  IShaderInitialization,
  Layer,
  Vec3,
  VertexAttributeSize
} from "src";*/

import { GLSettings } from "../../../../src/gl";
// import { InstanceProvider } from "../../../instance-provider";
import { Vec2, Vec3 } from "../../../../src/math/vector";
import { ILayerProps, Layer } from "../../../../src/surface/layer";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize
} from "../../../../src/types";
import { BlockInstance } from "./block-instance";
export interface IBlockLayerProps extends ILayerProps<BlockInstance> {
  cameraPosition?(): Vec3;
  bottomCenter?(): Vec2;
  dragX?(): number;
}
/**
 * Renders blocks of data with adjustable start and end values
 */
export class BlockLayer extends Layer<BlockInstance, IBlockLayerProps> {
  initShader(): IShaderInitialization<BlockInstance> {
    const { cameraPosition, bottomCenter, dragX } = this.props;

    const LB: Vec2 = [0, 0];
    const LT: Vec2 = [0, 1];
    const RB: Vec2 = [1, 0];
    const RT: Vec2 = [1, 1];

    const positions: Vec2[] = [
      // First triangle
      LB,
      LT,
      RT,

      // Second triangle
      LB,
      RT,
      RB
    ];

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      vs: require("./block-layer.vs"),
      fs: require("./block-layer.fs"),
      instanceAttributes: [
        {
          name: "startValue",
          size: InstanceAttributeSize.THREE,
          update: o => o.startValue
        },
        {
          name: "endValue",
          size: InstanceAttributeSize.THREE,
          update: o => o.endValue
        },
        {
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        },
        {
          name: "baseLine",
          size: InstanceAttributeSize.ONE,
          update: o => [o.baseLine]
        }
      ],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.TWO,
          update: vertex => positions[vertex]
        }
      ],
      uniforms: [
        {
          name: "cameraPosition",
          size: UniformSize.THREE,
          update: () => (cameraPosition ? cameraPosition() : [0, 0, 0])
        },
        {
          name: "bottomCenter",
          size: UniformSize.TWO,
          update: () => (bottomCenter ? bottomCenter() : [0, 0])
        },
        {
          name: "dragX",
          size: UniformSize.ONE,
          update: () => (dragX ? dragX() : 0)
        }
      ],
      vertexCount: 6
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return {};
  }
}
