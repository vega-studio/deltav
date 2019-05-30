import { InstanceProvider } from "../../instance-provider";
import { Bounds } from "../../primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IProjection,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import {
  CommonMaterialOptions,
  divide2,
  IAutoEasingMethod,
  subtract2,
  Vec,
  Vec2
} from "../../util";
import { ScaleMode } from "../types";
import { BorderInstance } from "./border-instance";

const { min, max } = Math;

export interface IBorderLayerProps<T extends BorderInstance>
  extends ILayerProps<T> {
  animate?: {
    color?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
  };
  atlas?: string;
  /** Scale factor determining the scale size of the border */
  scaleFactor?(): number;
}

/**
 * This layer displays Borders and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class BorderLayer<
  T extends BorderInstance,
  U extends IBorderLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IBorderLayerProps<BorderInstance> = {
    key: "",
    data: new InstanceProvider<BorderInstance>()
  };

  static attributeNames = {
    anchor: "anchor",
    color: "color",
    depth: "depth",
    fontScale: "fontScale",
    location: "location",
    maxScale: "maxScale",
    scale: "scale",
    scaling: "scaling",
    size: "size"
  };

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given border
      boundsAccessor: (border: BorderInstance) => {
        const anchorEffect = [0, 0];

        if (border.anchor) {
          anchorEffect[0] = border.anchor.x || 0;
          anchorEffect[1] = border.anchor.y || 0;
        }
        const topLeft = [
          border.position[0] - anchorEffect[0],
          border.position[1] - anchorEffect[1]
        ];

        return new Bounds({
          height: border.size[1],
          width: border.size[0],
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (
        border: BorderInstance,
        point: Vec2,
        projection: IProjection
      ) => {
        // The bounds of the border is in world space, but it does not account for the scale mode of the border.
        // Here, we will apply the scale mode testing to the border
        const maxScale = max(...projection.camera.scale);
        const minScale = min(...projection.camera.scale);

        // If we scale always then the border stays within it's initial world bounds at all times
        if (border.scaling === ScaleMode.ALWAYS) {
          return true;
        } else if (border.scaling === ScaleMode.BOUND_MAX) {
          // If we scale with bound max, then when the camera zooms in, the bounds will shrink to keep the
          // Border the same size. If the camera zooms out then the bounds === the world bounds.
          // We are zooming out. the bounds will stay within the world bounds
          if (minScale <= 1 && maxScale <= 1) {
            return true;
          } else {
            // We are zooming in. The bounds will shrink to keep the border at max font size
            // The location is within the world, but we reverse project the anchor spread
            const anchorEffect = [0, 0];

            if (border.anchor) {
              anchorEffect[0] = border.anchor.x || 0;
              anchorEffect[1] = border.anchor.y || 0;
            }

            const topLeft = [
              border.position[0] - anchorEffect[0] / maxScale,
              border.position[1] - anchorEffect[1] / maxScale
            ];

            // Reverse project the size and we should be within the distorted world coordinates
            return new Bounds({
              height: border.size[1] / maxScale,
              width: border.size[0] / maxScale,
              x: topLeft[0],
              y: topLeft[1]
            }).containsPoint(point);
          }
        } else if (border.scaling === ScaleMode.NEVER) {
          // If we never allow the border to scale, then the bounds will grow and shrink to counter the effects
          // Of the camera zoom
          // The location is within the world, but we reverse project the anchor spread
          const anchorEffect: Vec2 = [0, 0];

          if (border.anchor) {
            anchorEffect[0] = border.anchor.x || 0;
            anchorEffect[1] = border.anchor.y || 0;
          }

          const topLeft = subtract2(
            [border.position[0], border.position[1]],
            divide2(anchorEffect, projection.camera.scale)
          );

          const screenPoint = projection.worldToScreen(point);

          // Reverse project the size and we should be within the distorted world coordinates
          return new Bounds({
            height: border.size[1],
            width: border.size[0],
            x: topLeft[0],
            y: topLeft[1]
          }).containsPoint(screenPoint);
        }

        return true;
      }
    };
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<BorderInstance> {
    const animate = this.props.animate || {};
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1
    };

    const vertexToSide: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };

    const { scaleFactor = () => 1 } = this.props;

    return {
      fs: require("./border-layer.fs"),
      instanceAttributes: [
        {
          easing: animate.location,
          name: BorderLayer.attributeNames.location,
          size: InstanceAttributeSize.TWO,
          update: o => o.position
        },
        {
          name: BorderLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: o => [o.anchor.x || 0, o.anchor.y || 0]
        },
        {
          name: BorderLayer.attributeNames.size,
          size: InstanceAttributeSize.TWO,
          update: o => o.size
        },
        {
          name: BorderLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          name: BorderLayer.attributeNames.scaling,
          size: InstanceAttributeSize.ONE,
          update: o => [o.scaling]
        },
        {
          easing: animate.color,
          name: BorderLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        },
        {
          name: BorderLayer.attributeNames.scale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.scale]
        },
        {
          name: BorderLayer.attributeNames.maxScale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.maxScale]
        },
        {
          name: BorderLayer.attributeNames.fontScale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.fontScale]
        }
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: _u => [scaleFactor()]
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
      vs: require("./border-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
