import { InstanceProvider } from "../../../instance-provider";
import { IAutoEasingMethod, Vec } from "../../../math";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  IUniform,
  UniformSize,
  VertexAttributeSize
} from "../../../types";
import { CommonMaterialOptions } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { RingInstance } from "./ring-instance";

export interface IRingLayerProps<T extends RingInstance>
  extends ILayer2DProps<T> {
  /** This sets a scaling factor for the circle's radius */
  scaleFactor?(): number;
  animate?: {
    color?: IAutoEasingMethod<Vec>;
    center?: IAutoEasingMethod<Vec>;
    radius?: IAutoEasingMethod<Vec>;
  };
}

/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class RingLayer<
  T extends RingInstance,
  U extends IRingLayerProps<T>
> extends Layer2D<T, U> {
  static defaultProps: IRingLayerProps<RingInstance> = {
    key: "",
    data: new InstanceProvider<RingInstance>()
  };

  static attributeNames = {
    center: "center",
    radius: "radius",
    depth: "depth",
    color: "color",
    thickness: "thickness"
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<RingInstance> {
    const scaleFactor = this.props.scaleFactor || (() => 1);
    const animations = this.props.animate || {};
    const {
      color: animateColor,
      center: animateCenter,
      radius: animateRadius
    } = animations;

    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    };

    const vertexToSide: { [key: number]: number } = {
      0: -1,
      1: -1,
      2: -1,
      3: 1,
      4: 1,
      5: 1
    };

    return {
      fs: require("./ring-layer.fs"),
      instanceAttributes: [
        {
          easing: animateCenter,
          name: RingLayer.attributeNames.center,
          size: InstanceAttributeSize.TWO,
          update: o => o.center
        },
        {
          easing: animateRadius,
          name: RingLayer.attributeNames.radius,
          size: InstanceAttributeSize.ONE,
          update: o => [o.radius]
        },
        {
          name: RingLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          easing: animateColor,
          name: RingLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        },
        {
          name: RingLayer.attributeNames.thickness,
          size: InstanceAttributeSize.ONE,
          update: o => [o.thickness]
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: (_: IUniform) => [scaleFactor()]
        }
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex]
          ]
        }
      ],
      vertexCount: 6,
      vs: require("./ring-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
