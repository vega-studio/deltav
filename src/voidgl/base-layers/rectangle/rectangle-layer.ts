import * as Three from "three";
import { InstanceProvider } from "../../instance-provider";
import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import {
  IMaterialOptions,
  InstanceAttributeSize,
  IProjection,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { CommonMaterialOptions } from "../../util";
import { ScaleType } from "../types";
import { RectangleInstance } from "./rectangle-instance";

const { min, max } = Math;

export interface IRectangleLayerProps<T extends RectangleInstance>
  extends ILayerProps<T> {
  atlas?: string;
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
          rectangle.x - anchorEffect[0],
          rectangle.y - anchorEffect[1]
        ];

        return new Bounds({
          height: rectangle.height,
          width: rectangle.width,
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (
        rectangle: RectangleInstance,
        point: IPoint,
        projection: IProjection
      ) => {
        // The bounds of the rectangle is in world space, but it does not account for the scale mode of the rectangle.
        // Here, we will apply the scale mode testing to the rectangle
        const maxScale = max(...projection.camera.scale);
        const minScale = min(...projection.camera.scale);

        // If we scale always then the rectangle stays within it's initial world bounds at all times
        if (rectangle.scaling === ScaleType.ALWAYS) {
          return true;
        } else if (rectangle.scaling === ScaleType.BOUND_MAX) {
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
              rectangle.x - anchorEffect[0] / maxScale,
              rectangle.y - anchorEffect[1] / maxScale
            ];

            // Reverse project the size and we should be within the distorted world coordinates
            return new Bounds({
              height: rectangle.height / maxScale,
              width: rectangle.width / maxScale,
              x: topLeft[0],
              y: topLeft[1]
            }).containsPoint(point);
          }
        } else if (rectangle.scaling === ScaleType.NEVER) {
          // If we never allow the rectangle to scale, then the bounds will grow and shrink to counter the effects
          // Of the camera zoom
          // The location is within the world, but we reverse project the anchor spread
          const anchorEffect = [0, 0];

          if (rectangle.anchor) {
            anchorEffect[0] = rectangle.anchor.x || 0;
            anchorEffect[1] = rectangle.anchor.y || 0;
          }

          const topLeft = projection.worldToScreen({
            x: rectangle.x - anchorEffect[0] / projection.camera.scale[0],
            y: rectangle.y - anchorEffect[1] / projection.camera.scale[1]
          });

          const screenPoint = projection.worldToScreen(point);

          // Reverse project the size and we should be within the distorted world coordinates
          return new Bounds({
            height: rectangle.height,
            width: rectangle.width,
            x: topLeft.x,
            y: topLeft.y
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

    return {
      fs: require("./rectangle-layer.fs"),
      instanceAttributes: [
        {
          name: RectangleLayer.attributeNames.location,
          size: InstanceAttributeSize.TWO,
          update: o => [o.x, o.y]
        },
        {
          name: RectangleLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: o => [o.anchor.x || 0, o.anchor.y || 0]
        },
        {
          name: RectangleLayer.attributeNames.size,
          size: InstanceAttributeSize.TWO,
          update: o => [o.width, o.height]
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
          update: _u => [1]
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
      vs: require("./rectangle-layer.vs")
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
