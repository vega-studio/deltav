import {
  CommonMaterialOptions,
  GLSettings,
  IAutoEasingMethod,
  ILayer2DProps,
  ILayerMaterialOptions,
  InstanceAttributeSize,
  InstanceProvider,
  IShaderInitialization,
  IUniform,
  IVertexAttribute,
  Layer2D,
  UniformSize,
  Vec,
  VertexAttributeSize
} from "src";

import { ScaleMode } from "../type";
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

  sizeScale?(): number;

  scaleMode?: ScaleMode;

  maxScale?: number;
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
    scaleFactor: () => 1,
    sizeScale: () => 1,
    scaleMode: ScaleMode.ALWAYS,
    maxScale: Number.MAX_SAFE_INTEGER
  };

  static attributeNames = {
    center: "center",
    color: "color",
    depth: "depth",
    radius: "radius",
    anchor: "anchor"
  };

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<CircleInstance> {
    const {
      animate = {},
      scaleFactor = () => 1,
      sizeScale = () => 1,
      opacity = () => 1,
      scaleMode = ScaleMode.ALWAYS,
      maxScale = Number.MAX_SAFE_INTEGER
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

    let vs: string;
    switch (scaleMode) {
      case ScaleMode.ALWAYS: {
        vs = require("./shader/circle-layer-always.vs");
        break;
      }

      case ScaleMode.NEVER: {
        vs = require("./shader/circle-layer-never.vs");
        break;
      }

      case ScaleMode.BOUND_MAX: {
        vs = require("./shader/circle-layer-bound-max.vs");
        break;
      }
    }

    return {
      drawMode: GLSettings.Model.DrawMode.TRIANGLE_STRIP,
      fs: require("./circle-layer.fs"),
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
        },
        {
          name: CircleLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: circle => circle.anchor
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [scaleFactor()]
        },
        {
          name: "sizeScale",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [sizeScale()]
        },
        {
          name: "layerOpacity",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [opacity()]
        },
        {
          name: "maxScale",
          size: UniformSize.ONE,
          update: (_uniform: IUniform) => [maxScale]
        }
      ],
      vertexAttributes: vertexAttributes,
      vertexCount: vertexCount,
      vs
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
