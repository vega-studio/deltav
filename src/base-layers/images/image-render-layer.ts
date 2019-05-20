import { InstanceProvider } from "../../instance-provider";
import { Bounds } from "../../primitives";
import { atlasRequest } from "../../resources/texture/atlas-resource-request";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IProjection,
  IShaderInitialization,
  ResourceType,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { divide2, IAutoEasingMethod, subtract2, Vec, Vec2 } from "../../util";
import { CommonMaterialOptions } from "../../util/common-options";
import { ScaleMode } from "../types";
import { ImageInstance } from "./image-instance";

const { min, max } = Math;

export interface IImageRenderLayerProps<T extends ImageInstance>
  extends ILayerProps<T> {
  /** The id of the atlas to load resources into */
  atlas?: string;
  /** The properties we wish to animate for the image */
  animate?: {
    tint?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
    size?: IAutoEasingMethod<Vec>;
  };
  /**
   * This is the scale resources for the images will be loaded into the atlas. A value of
   * 0.5 will cause images to load at 50% their source size to the atlas.
   */
  rasterizationScale?: number;
}

/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export class ImageRenderLayer<
  T extends ImageInstance,
  U extends IImageRenderLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: IImageRenderLayerProps<any> = {
    key: "",
    data: new InstanceProvider<ImageInstance>()
  };

  /** Easy lookup of attribute names to aid in modifications to be applied to elements */
  static attributeNames = {
    location: "location",
    anchor: "anchor",
    size: "size",
    depth: "depth",
    scaling: "scaling",
    texture: "texture",
    tint: "tint"
  };

  /**
   * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
   * of elements
   */
  getInstancePickingMethods() {
    return {
      // Provide the calculated AABB world bounds for a given image
      boundsAccessor: (image: ImageInstance) => {
        const anchorEffect: Vec2 = [0, 0];

        if (image.anchor) {
          anchorEffect[0] = image.anchor.x || 0;
          anchorEffect[1] = image.anchor.y || 0;
        }

        const topLeft = subtract2(image.origin, anchorEffect);

        return new Bounds({
          height: image.height,
          width: image.width,
          x: topLeft[0],
          y: topLeft[1]
        });
      },

      // Provide a precise hit test for the circle
      hitTest: (image: ImageInstance, point: Vec2, view: IProjection) => {
        // The bounds of the image is in world space, but it does not account for the scale mode of the image.
        // Here, we will apply the scale mode testing to the image
        const maxScale = max(...view.camera.scale);
        const minScale = min(...view.camera.scale);

        // If we scale always then the image stays within it's initial world bounds at all times
        if (image.scaling === ScaleMode.ALWAYS) {
          return true;
        } else if (image.scaling === ScaleMode.BOUND_MAX) {
          // If we scale with bound max, then when the camera zooms in, the bounds will shrink to keep the
          // Image the same size. If the camera zooms out then the bounds === the world bounds.
          // We are zooming out. the bounds will stay within the world bounds
          if (minScale <= 1 && maxScale <= 1) {
            return true;
          } else {
            // We are zooming in. The bounds will shrink to keep the image at max font size
            // The location is within the world, but we reverse project the anchor spread
            const anchorEffect: Vec2 = [0, 0];

            if (image.anchor) {
              anchorEffect[0] = image.anchor.x || 0;
              anchorEffect[1] = image.anchor.y || 0;
            }

            const topLeft = subtract2(
              image.origin,
              divide2(anchorEffect, view.camera.scale)
            );

            const screenPoint = view.worldToScreen(point);

            // Reverse project the size and we should be within the distorted world coordinates
            return new Bounds({
              height: image.height,
              width: image.width,
              x: topLeft[0],
              y: topLeft[1]
            }).containsPoint(screenPoint);
          }
        } else if (image.scaling === ScaleMode.NEVER) {
          // If we never allow the image to scale, then the bounds will grow and shrink to counter the effects
          // Of the camera zoom
          // The location is within the world, but we reverse project the anchor spread
          const anchorEffect: Vec2 = [0, 0];

          if (image.anchor) {
            anchorEffect[0] = image.anchor.x || 0;
            anchorEffect[1] = image.anchor.y || 0;
          }

          const topLeft = view.worldToScreen(
            subtract2(image.origin, divide2(anchorEffect, view.camera.scale))
          );

          const screenPoint = view.worldToScreen(point);

          // Reverse project the size and we should be within the distorted world coordinates
          const bounds = new Bounds({
            height: image.height,
            width: image.width,
            x: topLeft[0],
            y: topLeft[1]
          });

          return bounds.containsPoint(screenPoint);
        }

        return true;
      }
    };
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<ImageInstance> {
    const animations = this.props.animate || {};
    const {
      tint: animateTint,
      location: animateLocation,
      size: animateSize
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
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1
    };

    return {
      fs: require("./image-layer.fs"),
      instanceAttributes: [
        {
          easing: animateLocation,
          name: ImageRenderLayer.attributeNames.location,
          size: InstanceAttributeSize.TWO,
          update: o => o.origin
        },
        {
          name: ImageRenderLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: o => [o.anchor.x || 0, o.anchor.y || 0]
        },
        {
          easing: animateSize,
          name: ImageRenderLayer.attributeNames.size,
          size: InstanceAttributeSize.TWO,
          update: o => [o.width, o.height]
        },
        {
          name: ImageRenderLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: o => [o.depth]
        },
        {
          name: ImageRenderLayer.attributeNames.scaling,
          size: InstanceAttributeSize.ONE,
          update: o => [o.scaling]
        },
        {
          name: ImageRenderLayer.attributeNames.texture,
          resource: {
            type: ResourceType.ATLAS,
            key: this.props.atlas || "",
            name: "imageAtlas"
          },
          update: o => {
            const source = o.source;

            if (!o.request) {
              o.request = atlasRequest({
                rasterizationScale: this.props.rasterizationScale,
                source
              });
            }

            const textureInfo = this.resource.request(this, o, o.request);
            return textureInfo;
          }
        },
        {
          easing: animateTint,
          name: ImageRenderLayer.attributeNames.tint,
          size: InstanceAttributeSize.FOUR,
          update: o => o.tint
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
      vs: require("./image-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentImageBlending;
  }
}
