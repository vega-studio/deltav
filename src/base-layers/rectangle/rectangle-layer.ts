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
import { CommonMaterialOptions, divide2, subtract2, Vec2 } from "../../util";
import { ScaleMode } from "../types";
import { RectangleInstance } from "./rectangle-instance";

const { min, max } = Math;

export interface IRectangleLayerProps<T extends RectangleInstance>
  extends ILayerProps<T> {
  /** Scale factor determining the scale size of the rectangle */
  scaleFactor?(): number;
}

/**
 * This layer displays Rectangles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class RectangleLayer<
  T extends RectangleInstance,
  U extends IRectangleLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IRectangleLayerProps<RectangleInstance> = {
    key: "",
    data: new InstanceProvider<RectangleInstance>()
  };

  static attributeNames = {
    anchor: "anchor",
    color: "color",
    depth: "depth",
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
      // Provide the calculated AABB world bounds for a given rectangle
      boundsAccessor: (rectangle: RectangleInstance) => {
        const anchorEffect = [0, 0];

        if (rectangle.anchor) {
          anchorEffect[0] = rectangle.anchor.x || 0;
          anchorEffect[1] = rectangle.anchor.y || 0;
        }
        const topLeft = [
          rectangle.position[0] - anchorEffect[0],
          rectangle.position[1] - anchorEffect[1]
        ];

        return new Bounds({
          height: rectangle.size[1],
          width: rectangle.size[0],
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (
        rectangle: RectangleInstance,
        point: Vec2,
        projection: IProjection
      ) => {
        // The bounds of the rectangle is in world space, but it does not account for the scale mode of the rectangle.
        // Here, we will apply the scale mode testing to the rectangle
        const maxScale = max(...projection.camera.scale);
        const minScale = min(...projection.camera.scale);

        // If we scale always then the rectangle stays within it's initial world bounds at all times
        if (rectangle.scaling === ScaleMode.ALWAYS) {
          return true;
        } else if (rectangle.scaling === ScaleMode.BOUND_MAX) {
          // If we scale with bound max, then when the camera zooms in, the bounds will shrink to keep the
          // Rectangle the same size. If the camera zooms out then the bounds === the world bounds.
          // We are zooming out. the bounds will stay within the world bounds
          if (minScale <= 1 && maxScale <= 1) {
            return true;
          } else {
            // We are zooming in. The bounds will shrink to keep the rectangle at max font size
            // The location is within the world, but we reverse project the anchor spread
            const anchorEffect = [0, 0];

            if (rectangle.anchor) {
              anchorEffect[0] = rectangle.anchor.x || 0;
              anchorEffect[1] = rectangle.anchor.y || 0;
            }

            const topLeft = [
              rectangle.position[0] - anchorEffect[0] / maxScale,
              rectangle.position[1] - anchorEffect[1] / maxScale
            ];

            // Reverse project the size and we should be within the distorted world coordinates
            return new Bounds({
              height: rectangle.size[1] / maxScale,
              width: rectangle.size[0] / maxScale,
              x: topLeft[0],
              y: topLeft[1]
            }).containsPoint(point);
          }
        } else if (rectangle.scaling === ScaleMode.NEVER) {
          // If we never allow the rectangle to scale, then the bounds will grow and shrink to counter the effects
          // Of the camera zoom
          // The location is within the world, but we reverse project the anchor spread
          const anchorEffect: Vec2 = [0, 0];

          if (rectangle.anchor) {
            anchorEffect[0] = rectangle.anchor.x || 0;
            anchorEffect[1] = rectangle.anchor.y || 0;
          }

          const topLeft = subtract2(
            [rectangle.position[0], rectangle.position[1]],
            divide2(anchorEffect, projection.camera.scale)
          );

          const screenPoint = projection.worldToScreen(point);

          // Reverse project the size and we should be within the distorted world coordinates
          return new Bounds({
            height: rectangle.size[1],
            width: rectangle.size[0],
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
  initShader(): IShaderInitialization<RectangleInstance> {
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
      fs: require("./rectangle-layer.fs"),
      instanceAttributes: [
        {
          name: RectangleLayer.attributeNames.location,
          size: InstanceAttributeSize.TWO,
          update: o => o.position
        },
        {
          name: RectangleLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: o => [o.anchor.x || 0, o.anchor.y || 0]
        },
        {
          name: RectangleLayer.attributeNames.size,
          size: InstanceAttributeSize.TWO,
          update: o => o.size
        },
        {
          name: RectangleLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          name: RectangleLayer.attributeNames.scaling,
          size: InstanceAttributeSize.ONE,
          update: o => [o.scaling]
        },
        {
          name: RectangleLayer.attributeNames.color,
          size: InstanceAttributeSize.FOUR,
          update: o => o.color
        },
        {
          name: RectangleLayer.attributeNames.scale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.scale]
        },
        {
          name: RectangleLayer.attributeNames.maxScale,
          size: InstanceAttributeSize.ONE,
          update: o => [o.maxScale]
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
      vs: require("./rectangle-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentShapeBlending;
  }
}
