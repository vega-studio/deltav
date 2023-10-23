import { InstanceProvider } from "../../../instance-provider";
import { IAutoEasingMethod, Vec } from "../../../math";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize,
} from "../../../types";
import { CommonMaterialOptions } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { RectangleInstance } from "./rectangle-instance";
import RectangleLayerFS from "./rectangle-layer.fs";
import RectangleLayerVS from "./rectangle-layer.vs";

export interface IRectangleLayerProps<T extends RectangleInstance>
  extends ILayer2DProps<T> {
  animate?: {
    color?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
  };
  /** Scale factor determining the scale size of the rectangle */
  scaleFactor?(): number;
}

/**
 * This layer displays Rectangles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class RectangleLayer<
  T extends RectangleInstance,
  U extends IRectangleLayerProps<T>,
> extends Layer2D<T, U> {
  static defaultProps: IRectangleLayerProps<RectangleInstance> = {
    key: "",
    data: new InstanceProvider<RectangleInstance>(),
  };

  static attributeNames = {
    anchor: "anchor",
    color: "color",
    depth: "depth",
    location: "location",
    maxScale: "maxScale",
    scale: "scale",
    scaling: "scaling",
    size: "size",
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<RectangleInstance> {
    const animate = this.props.animate || {};
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1,
    };

    const vertexToSide: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1,
    };

    const { scaleFactor = () => 1 } = this.props;

    return {
      fs: RectangleLayerFS,
      instanceAttributes: [
        {
          easing: animate.location,
          name: RectangleLayer.attributeNames.location,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.position,
        },
        {
          name: RectangleLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: (o) => [o.anchor.x || 0, o.anchor.y || 0],
        },
        {
          name: RectangleLayer.attributeNames.size,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.size,
        },
        {
          name: RectangleLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.depth],
        },
        {
          name: RectangleLayer.attributeNames.scaling,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.scaling],
        },
        {
          easing: animate.color,
          name: RectangleLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.color,
        },
        {
          name: RectangleLayer.attributeNames.scale,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.scale],
        },
        {
          name: RectangleLayer.attributeNames.maxScale,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.maxScale],
        },
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: (_u) => [scaleFactor()],
        },
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex],
          ],
        },
      ],
      vertexCount: 6,
      vs: RectangleLayerVS,
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
