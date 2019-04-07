import { InstanceProvider } from "../../instance-provider";
import { Bounds } from "../../primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IProjection,
  IShaderInitialization,
  IUniform,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import {
  CommonMaterialOptions,
  dot2,
  IAutoEasingMethod,
  subtract2,
  Vec,
  Vec2
} from "../../util";
import { RingInstance } from "./ring-instance";
const { max } = Math;

export interface IRingLayerProps<T extends RingInstance>
  extends ILayerProps<T> {
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
> extends Layer<T, U> {
  static defaultProps: IRingLayerProps<RingInstance> = {
    key: "",
    data: new InstanceProvider<RingInstance>(),
    scene: "default"
  };

  static attributeNames = {
    center: "center",
    radius: "radius",
    depth: "depth",
    color: "color",
    thickness: "thickness"
  };

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given circle
      boundsAccessor: (ring: RingInstance) =>
        new Bounds({
          height: ring.radius * 2,
          width: ring.radius * 2,
          x: ring.center[0] - ring.radius,
          y: ring.center[1] - ring.radius
        }),

      // Provide a precise hit test for the ring
      hitTest: (ring: RingInstance, point: Vec2, view: IProjection) => {
        const r = ring.radius / max(...view.camera.scale);
        const delta = subtract2(point, ring.center);

        return dot2(delta, delta) < r * r;
      }
    };
  }

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
