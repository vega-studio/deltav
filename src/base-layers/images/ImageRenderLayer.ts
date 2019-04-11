import { ImageAtlasResourceRequest } from "src/resources";

import { InstanceProvider } from "../../instance-provider";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  ResourceType,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { CommonMaterialOptions } from "../../util/common-options";
import { ScaleMode } from "../types";
import { ImageInstance } from "./image-instance";

export interface IImageRenderLayerOptions<T extends ImageInstance>
  extends ILayerProps<T> {
  resourceKey?: string;
  atlas?: string;
  animate?: {
    tint?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
    size?: IAutoEasingMethod<Vec>;
  };
  scaleMode?: ScaleMode;
}

export class ImageRenderLayer<
  T extends ImageInstance,
  U extends IImageRenderLayerOptions<T>
> extends Layer<T, U> {
  static defaultProps: IImageRenderLayerOptions<ImageInstance> = {
    key: "",
    data: new InstanceProvider<ImageInstance>(),
    resourceKey: "No resource specified",
    scene: "default"
  };

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
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<ImageInstance> {
    console.warn("image render layer init shader");
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
          update: o => o.position
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
            key: this.props.resourceKey || "",
            name: "imageAtlas",
            type: ResourceType.ATLAS
          },
          update: o => {
            if (!o.request) {
              if (typeof o.source === "string") {
                const image = o.element;
                o.request = new ImageAtlasResourceRequest({
                  path: o.source,
                  element: image
                });
              }
            }

            return this.resource.request(this, o, o.request);
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
      vs: require("./image-layer.vs")
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentImageBlending;
  }
}
