import {
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  IShaderInitialization,
  Layer,
  UniformSize,
  Vec2,
  Vec3,
  VertexAttributeSize
} from "src";
import { PlateEndInstance } from "./plate-end-instance";

export interface IPlateEndLayerProps extends ILayerProps<PlateEndInstance> {
  bottomCenter?(): Vec2;
  lightDirection?(): Vec3;
}

export class PlateEndLayer extends Layer<
  PlateEndInstance,
  IPlateEndLayerProps
> {
  initShader(): IShaderInitialization<PlateEndInstance> {
    const { bottomCenter, lightDirection } = this.props;

    const LB: Vec2 = [-1, 0];
    const RB: Vec2 = [1, 0];
    const LT: Vec2 = [-1, 1];
    const RT: Vec2 = [1, 1];

    const positions = [LB, RT, LT, LB, RB, RT];

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLES,
      vs: require("./plate-end-layer.vs"),
      fs: require("./plate-end-layer.fs"),
      instanceAttributes: [
        {
          name: "width",
          size: InstanceAttributeSize.ONE,
          update: o => [o.width]
        },
        {
          name: "height",
          size: InstanceAttributeSize.ONE,
          update: o => [o.height]
        },
        {
          name: "base",
          size: InstanceAttributeSize.TWO,
          update: o => o.base
        },
        {
          name: "normal",
          size: InstanceAttributeSize.THREE,
          update: o => o.normal
        },
        {
          name: "color",
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
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
          name: "bottomCenter",
          size: UniformSize.TWO,
          update: () => (bottomCenter ? bottomCenter() : [0, 0])
        },
        {
          name: "lightDirection",
          size: UniformSize.THREE,
          update: () => (lightDirection ? lightDirection() : [0, 0, 0])
        }
      ],
      vertexCount: 6
    };
  }
}
