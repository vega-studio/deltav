import { InstanceProvider } from "../../instance-provider";
import { ILayerProps, Layer } from "../../surface/layer";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize
} from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { CommonMaterialOptions } from "../../util/common-options";
import { ImageInstance } from "./image-instance";

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
            key: () => this.props.atlas || "",
            name: "imageAtlas"
          },
          update: o => {
            o.source;

            if (!o.request) {
              console.warn(
                "An image utilizing the image-render-layer does not have its request specified yet.",
                "The image-render-layer does NOT manage requests and should be handled before this layer deals with the instance"
              );

              return [0, 0, 0, 0];
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
