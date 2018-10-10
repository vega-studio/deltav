import * as Three from "three";
import { InstanceProvider } from "../../instance-provider";
import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import {
  IMaterialOptions,
  InstanceAttributeSize,
  IProjection,
  IShaderInitialization,
  IUniform,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { CommonMaterialOptions, Vec } from "../../util";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { CircleInstance } from "./circle-instance";

export interface ICircleLayerProps<T extends CircleInstance>
  extends ILayerProps<T> {
  /** This sets the  */
  fadeOutOversized?: number;
  /** This sets a scaling factor for the circle's radius */
  scaleFactor?(): number;
  /** Flags this layer to draw  */
  disableDepthTest?: boolean;
  /** Opacity of the layer as a whole */
  opacity?: number;
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
}

/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class CircleLayer<
  T extends CircleInstance,
  U extends ICircleLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: ICircleLayerProps<CircleInstance> = {
    data: new InstanceProvider<CircleInstance>(),
    fadeOutOversized: -1,
    key: "",
    scaleFactor: () => 1
  };

  static attributeNames = {
    center: "center",
    radius: "radius",
    depth: "depth",
    color: "color"
  };

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    const noScaleFactor = () => 1;

    return {
      // Provide the calculated AABB world bounds for a given circle
      boundsAccessor: (circle: CircleInstance) =>
        new Bounds({
          height: circle.radius * 2,
          width: circle.radius * 2,
          x: circle.center[0] - circle.radius,
          y: circle.center[1] - circle.radius
        }),

      // Provide a precise hit test for the circle
      hitTest: (circle: CircleInstance, point: IPoint, view: IProjection) => {
        const circleScreenCenter = view.worldToScreen({
          x: circle.center[0],
          y: circle.center[1]
        });
        const mouseScreen = view.worldToScreen(point);
        const r = circle.radius * (this.props.scaleFactor || noScaleFactor)();

        const delta = [
          mouseScreen.x - circleScreenCenter.x,
          mouseScreen.y - circleScreenCenter.y
        ];

        return delta[0] * delta[0] + delta[1] * delta[1] < r * r;
      }
    };
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<CircleInstance> {
    const scaleFactor = this.props.scaleFactor || (() => 1);
    const animations = this.props.animate || {};
    const {
      center: animateCenter,
      radius: animateRadius,
      color: animateColor
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
          update: (_uniform: IUniform) => [
            this.props.opacity === undefined ? 1.0 : this.props.opacity
          ]
        }
      ],
      vertexAttributes: [
        // TODO: This is from the heinous evils of THREEJS and their inability to fix a bug within our lifetimes.
        // Right now position is REQUIRED in order for rendering to occur, otherwise the draw range gets updated to
        // Zero against your wishes.
        {
          name: "position",
          size: VertexAttributeSize.THREE,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex],
            0
          ]
        }
      ],
      vertexCount: 6,
      vs: require("./circle-layer.vs")
    };
  }

  getModelType(): IModelType {
    return {
      drawMode: Three.TriangleStripDrawMode,
      modelType: Three.Mesh
    };
  }

  getMaterialOptions(): IMaterialOptions {
    return CommonMaterialOptions.transparentShape;
  }
}
