import { GLSettings } from "../../../../src/gl";
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
  bottomCenter?(): Vec2;
  lightDirection?(): Vec3;
}
/**
 * Renders blocks of data with adjustable start and end values
 */
export class BlockLayer extends Layer<BlockInstance, IBlockLayerProps> {
  initShader(): IShaderInitialization<BlockInstance> {
    const { bottomCenter, lightDirection } = this.props;

    const FRT: Vec3 = [1, 1, 1];
    const BRT: Vec3 = [1, 1, -1];
    const BRB: Vec3 = [1, 0, -1];
    const FRB: Vec3 = [1, 0, 1];
    const FLT: Vec3 = [0, 1, 1];
    const BLT: Vec3 = [0, 1, -1];
    const BLB: Vec3 = [0, 0, -1];
    const FLB: Vec3 = [0, 0, 1];

    const positions: Vec3[] = [
      // Front face
      FLB,
      FLT,
      FRT,
      FLB,
      FRT,
      FRB,

      // Top face
      FLT,
      BLT,
      BRT,
      FLT,
      BRT,
      FRT,

      // Back face
      BLB,
      BRT,
      BLT,

      BLB,
      BRB,
      BRT
    ];

    const normals = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2];

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
          name: "baseY",
          size: InstanceAttributeSize.ONE,
          update: o => [o.baseY]
        },
        {
          name: "baseZ",
          size: InstanceAttributeSize.ONE,
          update: o => [o.baseZ]
        },
        {
          name: "normal1",
          size: InstanceAttributeSize.THREE,
          update: o => o.normal1
        },
        {
          name: "normal2",
          size: InstanceAttributeSize.THREE,
          update: o => o.normal2
        },
        {
          name: "normal3",
          size: InstanceAttributeSize.THREE,
          update: o => o.normal3
        }
      ],
      vertexAttributes: [
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: vertex => positions[vertex]
        },
        {
          name: "nIndex",
          size: VertexAttributeSize.ONE,
          update: vertex => [normals[vertex]]
        }
      ],
      uniforms: [
        {
          name: "bottomCenter",
          size: UniformSize.TWO,
          update: () => (bottomCenter ? bottomCenter() : [0, 0])
        },
        {
          name: "lightDirection",
          size: UniformSize.THREE,
          update: () => (lightDirection ? lightDirection() : [1, 1, 1])
        }
      ],
      vertexCount: 18
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return {};
  }
}
