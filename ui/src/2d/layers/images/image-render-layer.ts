import ImageLayerFS from "./image-layer.fs";
import ImageLayerVS from "./image-layer.vs";
import { CommonMaterialOptions } from "../../../util/common-options";
import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import {
  ILayerMaterialOptions,
  InstanceAttributeSize,
  IShaderInitialization,
  UniformSize,
  VertexAttributeSize,
} from "../../../types";
import { ImageInstance } from "./image-instance";
import { InstanceProvider } from "../../../instance-provider";
import { LayerScene, Surface } from "../../../surface";

export interface IImageRenderLayerProps<TInstance extends ImageInstance>
  extends ILayer2DProps<TInstance> {
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
  TInstance extends ImageInstance,
  TLayerProps extends IImageRenderLayerProps<TInstance>,
> extends Layer2D<TInstance, TLayerProps> {
  static defaultProps: IImageRenderLayerProps<any> = {
    key: "",
    data: new InstanceProvider<ImageInstance>(),
  };

  /** Easy lookup of attribute names to aid in modifications to be applied to elements */
  static attributeNames = {
    location: "location",
    anchor: "anchor",
    size: "size",
    depth: "depth",
    scaling: "scaling",
    texture: "texture",
    tint: "tint",
  };

  constructor(surface: Surface, scene: LayerScene, props: TLayerProps) {
    // We do not establish bounds in the layer. The surface manager will take care of that for us
    // After associating the layer with the view it is a part of.
    super(surface, scene, props);
  }

  /**
   * Define our shader and it's inputs
   */
  initShader(): IShaderInitialization<TInstance> {
    const animations = this.props.animate || {};
    const {
      tint: animateTint,
      location: animateLocation,
      size: animateSize,
    } = animations;
    const vertexToNormal: { [key: number]: number } = {
      0: 1,
      1: 1,
      2: -1,
      3: 1,
      4: -1,
      5: -1,
    };

    const vertexToSide: { [key: number]: number } = {
      0: 0,
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 1,
    };

    return {
      fs: ImageLayerFS,
      instanceAttributes: [
        {
          easing: animateLocation,
          name: ImageRenderLayer.attributeNames.location,
          size: InstanceAttributeSize.TWO,
          update: (o) => o.origin,
        },
        {
          name: ImageRenderLayer.attributeNames.anchor,
          size: InstanceAttributeSize.TWO,
          update: (o) => [o.anchor.x || 0, o.anchor.y || 0],
        },
        {
          easing: animateSize,
          name: ImageRenderLayer.attributeNames.size,
          size: InstanceAttributeSize.TWO,
          update: (o) => [o.width, o.height],
        },
        {
          name: ImageRenderLayer.attributeNames.depth,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.depth],
        },
        {
          name: ImageRenderLayer.attributeNames.scaling,
          size: InstanceAttributeSize.ONE,
          update: (o) => [o.scaling],
        },
        {
          name: ImageRenderLayer.attributeNames.texture,
          resource: {
            key: () => this.props.atlas || "",
            name: "imageAtlas",
          },
          update: (o) => {
            o.source;

            if (!o.request) {
              console.warn(
                "An image utilizing the image-render-layer does not have its request specified yet.",
                "The image-render-layer does NOT manage requests and should be handled before this layer deals with the instance"
              );

              return [0, 0, 0, 0];
            }

            return this.resource.request(this, o, o.request);
          },
        },
        {
          easing: animateTint,
          name: ImageRenderLayer.attributeNames.tint,
          size: InstanceAttributeSize.FOUR,
          update: (o) => o.tint,
        },
      ],
      uniforms: [
        {
          name: "scaleFactor",
          size: UniformSize.ONE,
          update: (_u) => [1],
        },
      ],
      vertexAttributes: [
        {
          name: "normals",
          size: VertexAttributeSize.TWO,
          update: (vertex: number) => [
            // Normal
            vertexToNormal[vertex],
            // The side of the quad
            vertexToSide[vertex],
          ],
        },
      ],
      vertexCount: 6,
      vs: ImageLayerVS,
    };
  }

  getMaterialOptions(): ILayerMaterialOptions {
    return CommonMaterialOptions.transparentImageBlending;
  }
}
