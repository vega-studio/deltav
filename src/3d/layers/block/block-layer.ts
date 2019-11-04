/*import {
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  IShaderInitialization,
  Layer,
  Vec3,
  VertexAttributeSize
} from "src";*/

import { GLSettings } from "../../../gl";
// import { InstanceProvider } from "../../../instance-provider";
import { Vec2 } from "../../../math/vector";
import { ILayerProps, Layer } from "../../../surface/layer";
import {
  InstanceAttributeSize,
  IShaderInitialization,
  VertexAttributeSize
} from "../../../types";
import { BlockInstance } from "./block-instance";
export interface IBlockLayerProps extends ILayerProps<BlockInstance> {}
/**
 * Renders blocks of data with adjustable start and end values
 */
export class BlockLayer extends Layer<BlockInstance, IBlockLayerProps> {
  initShader(): IShaderInitialization<BlockInstance> {
    /*const FRT: Vec3 = [1, 1, 1];
    const BRT: Vec3 = [1, 1, -1];
    const BRB: Vec3 = [1, -1, -1];
    const FRB: Vec3 = [1, -1, 1];
    const FLT: Vec3 = [-1, 1, 1];
    const BLT: Vec3 = [-1, 1, -1];
    const BLB: Vec3 = [-1, -1, -1];
    const FLB: Vec3 = [-1, -1, 1];*/

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
      vertexCount: 6
    };
  }
}
