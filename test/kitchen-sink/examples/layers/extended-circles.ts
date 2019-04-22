import {
  CircleInstance,
  CircleLayer,
  extendShaderInitialization,
  ICircleLayerProps,
  InstanceProvider,
  IShaderInitialization,
  UniformSize
} from "src";

export interface IExtendedCirclesProps
  extends ICircleLayerProps<CircleInstance> {
  dimming?: number;
}

export class ExtendedCircles extends CircleLayer<
  CircleInstance,
  IExtendedCirclesProps
> {
  static defaultProps: IExtendedCirclesProps = {
    data: new InstanceProvider<CircleInstance>(),
    key: "",
    scene: "default"
  };

  initShader(): IShaderInitialization<CircleInstance> {
    const shaderIO = extendShaderInitialization(super.initShader(), {
      uniforms: [
        {
          name: "dimming",
          size: UniformSize.ONE,
          update: () => [this.props.dimming || 0]
        }
      ],
      vs: {
        body: require("./extended-circles-extend-body.vs"),
        header: require("./extended-circles-extend-header.vs")
      }
    });

    return shaderIO;
  }
}