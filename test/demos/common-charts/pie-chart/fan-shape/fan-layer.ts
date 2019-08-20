import {
  ILayerProps,
  InstanceProvider,
  IShaderInitialization,
  Layer2D
} from "src";
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
    radius: "radius"
  };

  initShader(): IShaderInitialization<FanInstance> {
    const MAX_SEGMENTS = 150;

    const vertexToNormal;
  }
}
