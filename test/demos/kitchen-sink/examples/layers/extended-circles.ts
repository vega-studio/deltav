import {
  CircleInstance,
  CircleLayer,
  extendShader,
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
  };

  initShader(): IShaderInitialization<CircleInstance> {
    const shaderIO = extendShader(super.initShader(), {
      uniforms: [
        {
          name: "dimming",
          size: UniformSize.ONE,
          update: () => [this.props.dimming || 0]
        }
      ],
      vs: {
        header: '${import: dimColor}',
        main: {
          post: require("./extended-circles-extend-body.vs"),
        },
      }
    });

    return shaderIO;
  }
}
