import { CircleInstance, CircleLayer, ICircleLayerProps } from "src";

export class CustomCircleLayer extends CircleLayer<
  CircleInstance,
  ICircleLayerProps<CircleInstance>
> {}
