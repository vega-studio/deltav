import { GLSettings } from "../../../gl";
import { InstanceProvider } from "../../../instance-provider";
import { Vec } from "../../../math";
import { IAutoEasingMethod } from "../../../math/auto-easing-method";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  IUniform,
  IVertexAttribute,
  UniformSize,
  VertexAttributeSize
} from "../../../types";
import { CommonMaterialOptions } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { CircleInstance } from "./circle-instance";

export interface ICircleLayerProps<T extends CircleInstance>
  extends ILayer2DProps<T> {
  /**
   * This is the properties that can toggle on animations.
   *
   * NOTE: The more properties declared as animated will reduce the performance of the layer.
   * if animated properties are created, it can be beneficial to have other layers with no
   * animations be available for the Instances to 'rest' in when not moving.
   */
  animate?: {
    center?: IAutoEasingMethod<Vec>;
    radius?: IAutoEasingMethod<Vec>;
    color?: IAutoEasingMethod<Vec>;
  };
  /** This sets a scaling factor for the circle's radius */
  scaleFactor?(): number;
  /** Opacity of the layer as a whole */
  opacity?(): number;
  /**
   * When set, this causes the circles to be rendered utilizing the hardware POINTS mode. POINTS mode has limitations:
   * Different GPUs have different MAX POINT SIZE values, so the points can only be rendered up to a certain size. Also
   * points can have unexpected culling that occurs at the edge of the viewport.
   *
   * However, this mode has GREATLY improved performance when utilized correctly. So use for the correct situation, but
   * beware it's weak 'points' <- this is a pun in the comments of this code base. <- this is me being over zealous in
   * clarifying so the apostraphes don't lead to unecessary conclusions.
   */
  usePoints?: boolean;
}

/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class CircleLayer<
  T extends CircleInstance,
  U extends ICircleLayerProps<T>
> extends Layer2D<T, U> {
  static defaultProps: ICircleLayerProps<CircleInstance> = {
    data: new InstanceProvider<CircleInstance>(),
    key: "",
    scaleFactor: () => 1
  };

  static attributeNames = {
    center: "center",
    color: "color",
    depth: "depth",
    radius: "radius"
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<CircleInstance> {
    const {
      animate = {},
      scaleFactor = () => 1,
      usePoints = false,
      opacity = () => 1
    } = this.props;

    const {
      center: animateCenter,
      radius: animateRadius,
      color: animateColor
    } = animate;

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

    const vertexAttributes: IVertexAttribute[] = [
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
    ];

    const vertexCount = 6;

    return {
      drawMode: usePoints
        ? GLSettings.Model.DrawMode.POINTS
        : GLSettings.Model.DrawMode.TRIANGLE_STRIP,
      fs: usePoints
        ? require("./circle-layer-points.fs")
        : require("./circle-layer.fs"),
      instanceAttributes: [
        {
          easing: animateCenter,
          name: CircleLayer.attributeNames.center,
          size: InstanceAttributeSize.TWO,
          update: circle => circle.center
        },
        {
          easing: animateRadius,
          name: CircleLayer.attributeNames.radius,
          size: InstanceAttributeSize.ONE,
          update: circle => [circle.radius]
        },
        {
          name: CircleLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: circle => [circle.depth]
        },
        {
          easing: animateColor,
          name: CircleLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: circle => circle.color
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [scaleFactor()]
        },
        {
          name: "layerOpacity",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [opacity()]
        }
      ],
      vertexAttributes: usePoints ? undefined : vertexAttributes,
      vertexCount: usePoints ? 0 : vertexCount,
      vs: usePoints
        ? require("./circle-layer-points.vs")
        : require("./circle-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
