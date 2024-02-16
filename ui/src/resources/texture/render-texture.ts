import { WebGLRenderer } from "../../gl";
import { Texture, TextureOptions } from "../../gl/texture";
import { ResourceType, TextureSize } from "../../types";
import { IdentifyByKey } from "../../util/identify-by-key";
import { BaseResourceOptions } from "../base-resource-manager";

/**
 * Options required for generating a RenderTexture.
 */
export interface IRenderTextureResource extends BaseResourceOptions {
  /** Set the type of the resource to explicitally be an atlas resource */
  type: ResourceType.TEXTURE;
  /** This is the height of the texture */
  height: number;
  /** This is the width of the texture */
  width: number;
  /**
   * This applies any desired settings to the Texture.
   * Some noteable defaults this system sets:
   *  - generateMipMaps is true and
   *  - premultiply alpha is true.
   */
  textureSettings?: TextureOptions;
}

/**
 * Use this to aid in creating a texture in the resources portion of configuring
 * your surface.
 */
export function createTexture(
  options: Omit<IRenderTextureResource, "type" | "key"> &
    Partial<Pick<IRenderTextureResource, "key">>
): IRenderTextureResource {
  return {
    key: "",
    type: ResourceType.TEXTURE,
    ...options,
  };
}

/**
 * Type guard for the Render Texture resource type.
 */
export function isRenderTextureResource(
  val: any
): val is IRenderTextureResource {
  return val && val.key !== void 0 && val.type === ResourceType.TEXTURE;
}

/**
 * This defines a general purpose texture that can be rendered into and be
 * rendered.
 */
export class RenderTexture
  extends IdentifyByKey
  implements IRenderTextureResource
{
  /** Set the type of the resource to explicitally be an atlas resource */
  type: ResourceType.TEXTURE = ResourceType.TEXTURE;
  /** This is the height of the texture */
  height: number;
  /** This is the width of the texture */
  width: number;
  /**
   * This applies any desired settings to the Texture.
   * Some noteable defaults this system sets:
   *  - generateMipMaps is true and
   *  - premultiply alpha is true.
   */
  textureSettings?: TextureOptions;
  /** The actual texture resource generated */
  texture!: Texture;

  constructor(options: IRenderTextureResource, renderer?: WebGLRenderer) {
    super(options);
    this.height = options.height;
    this.width = options.width;
    this.textureSettings = options.textureSettings;
    this.createTexture(renderer);
  }

  /**
   * Frees up resources associated with this object. This object is no longer
   * valid after this is called and will produce undefined results if attempted
   * to use again.
   */
  destroy() {
    this.texture.destroy();
  }

  /**
   * This generates the texture object needed for this atlas.
   */
  private createTexture(renderer?: WebGLRenderer) {
    if (this.texture) return;

    // Establish the settings to be applied to the Texture. Provide some default
    // configuration.
    this.textureSettings = {
      generateMipMaps: true,
      premultiplyAlpha: false,
      ...this.textureSettings,
    };

    let width, height;
    const size = renderer?.getRenderSize() || [1, 1];

    if (this.width <= TextureSize.SCREEN) {
      if (!renderer) {
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      }

      width = size[0] / -this.width;
    } else width = this.width;

    if (this.height <= TextureSize.SCREEN) {
      if (!renderer) {
        throw new Error(
          "Can not generate Render Texture with a dynamic width or height when the WebGLRenderer is not available"
        );
      }

      height = size[1] / -this.width;
    } else height = this.height;

    // Generate the texture
    this.texture = new Texture({
      data: this.textureSettings?.data || {
        width,
        height,
        buffer: null,
      },
      ...this.textureSettings,
    });
  }
}
