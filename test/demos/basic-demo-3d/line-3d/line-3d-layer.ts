import {
  AutoEasingMethod,
  CommonMaterialOptions,
  createAttribute,
  createVertex,
  GLSettings,
  ILayerProps,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  Layer,
  VertexAttributeSize
} from "../../../../src";
import { Line3DInstance } from "./line-3d-instance";

export class Line3DLayer extends Layer<
  Line3DInstance,
  ILayerProps<Line3DInstance>
> {
  static defaultProps: ILayerProps<Line3DInstance> = {
    key: "",
    data: new InstanceProvider<Line3DInstance>()
  };

  initShader(): IShaderInitialization<Line3DInstance> {
    const vertexCount = 2;

    return {
      drawMode: GLSettings.Model.DrawMode.LINES,
      fs: require("./line-3d-layer.fs"),
      instanceAttributes: [
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: "start",
          size: InstanceAttributeSize.THREE,
          update: o => o.start
        }),
        createAttribute({
          easing: AutoEasingMethod.easeInOutCubic(500),
          name: "end",
          size: InstanceAttributeSize.FOUR,
          update: o => o.end
        }),
        createAttribute({
          name: "colorStart",
          size: InstanceAttributeSize.THREE,
          update: o => o.colorStart
        }),
        createAttribute({
          name: "colorEnd",
          size: InstanceAttributeSize.FOUR,
          update: o => o.colorEnd
        }),
      ],
      uniforms: [],
      vertexAttributes: [
        createVertex({
          name: "interpolation",
          size: VertexAttributeSize.ONE,
          update: (vertex: number) => [vertex / (vertexCount - 1)]
        }),
      ],
      vertexCount,
      vs: require("./line-3d-layer.vs")
    };
  }

  getMaterialOptions() {
    return Object.assign({}, CommonMaterialOptions.transparentShapeBlending, {
      cullSide: GLSettings.Material.CullSide.NONE
    });
  }
}
