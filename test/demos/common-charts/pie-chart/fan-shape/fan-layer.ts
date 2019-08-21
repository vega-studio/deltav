import { Vec2 } from "@diniden/signal-processing";
import {
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer2D,
  VertexAttributeSize
} from "../../../../../src";
import { FanInstance } from "./fan-instance";

export interface IFanLayerProps<T extends FanInstance> extends ILayerProps<T> {}

export class FanLayer<
  T extends FanInstance,
  U extends IFanLayerProps<T>
> extends Layer2D<T, U> {
  static defaultProps: IFanLayerProps<FanInstance> = {
    data: new InstanceProvider<FanInstance>(),
    key: ""
  };

  static attributeNames = {
    angle: "angle",
    center: "center",
    color: "color",
    edgeColor: "edgeColor",
    depth: "depth",
    radius: "radius",
    gap: "gap"
  };

  initShader(): IShaderInitialization<FanInstance> {
    const MAX_SEGMENTS = 100;

    const vertices: { [key: number]: Vec2 } = {
      0: [0, 0]
    };

    for (let i = 0; i <= MAX_SEGMENTS; i++) {
      vertices[i + 1] = [i / MAX_SEGMENTS, 1];
    }

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLE_FAN,
      fs: require("./fan-layer.fs"),
      instanceAttributes: [
        {
          name: FanLayer.attributeNames.angle,
          size: InstanceAttributeSize.TWO,
          update: o => o.angle
        },
        {
          name: FanLayer.attributeNames.center,
          size: InstanceAttributeSize.TWO,
          update: o => o.center
        },
        {
          name: FanLayer.attributeNames.radius,
          size: InstanceAttributeSize.ONE,
          update: o => [o.radius]
        },
        {
          name: FanLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          name: FanLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        },
        {
          name: FanLayer.attributeNames.edgeColor,
          size: InstanceAttributeSize.FOUR,
          update: o => o.edgeColor
        },
        {
          name: FanLayer.attributeNames.gap,
          size: InstanceAttributeSize.ONE,
          update: o => [o.gap]
        }
      ],
      uniforms: [],
      vertexAttributes: [
        {
          name: "vertex",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => vertices[vertex]
        }
      ],
      vertexCount: MAX_SEGMENTS + 2,
      vs: require("./fan-layer.vs")
    };
  }
}
