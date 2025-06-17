import { GLSettings, WebGLRenderer } from "../../gl";
import { ColorBuffer, ColorBufferOptions } from "../../gl/color-buffer.js";
import { ResourceType, TextureSize } from "../../types.js";
import { IdentifyByKey } from "../../util/identify-by-key.js";
import { BaseResourceOptions } from "../base-resource-manager.js";

/**
 * Options required for generating a RenderTexture.
 */
export interface IColorBufferResource extends BaseResourceOptions {
  /** Set the type of the resource to explicitally be an atlas resource */
  type: ResourceType.COLOR_BUFFER;
  /**
   * This is the height of the texture. Use the TextureSize to set a sensical
   * size or set a specialized sizing based on screen dimensions.
   */
  height: number;
  /**
   * This is the width of the texture. Use the TextureSize to set a sensical
   * size or set a specialized sizing based on screen dimensions.
   */
  width: number;
  /**
   * This applies any desired settings to the Texture.
   * Some noteable defaults this system sets:
   *  - generateMipMaps is true and
   *  - premultiply alpha is true.
   */
  colorBufferSettings?: ColorBufferOptions;
}

/**
 * Use this to aid in creating a texture in the resources portion of configuring
 * your surface.
 */
export function createColorBuffer(
  options: Omit<IColorBufferResource, "type" | "key"> &
    Partial<Pick<IColorBufferResource, "key">>
): IColorBufferResource {
  return {
    key: "",
    type: ResourceType.COLOR_BUFFER,
    ...options,
  };
}

/**
 * Type guard for the Render Texture resource type.
 */
export function isColorBufferResource(val: any): val is IColorBufferResource {
  return (
    val !== void 0 &&
    val.key !== void 0 &&
    val.type === ResourceType.COLOR_BUFFER
  );
}

/**
 * This defines a general purpose color buffer resource that can be rendered
 * into.
 */
export class ColorBufferResource
  extends IdentifyByKey
  implements IColorBufferResource
{
  /** Set the type of the resource to explicitally be a color buffer resource */
  type: ResourceType.COLOR_BUFFER = ResourceType.COLOR_BUFFER;
  /** This is the internal height of the buffer */
  height: number;
  /** This is the internal width of the buffer */
  width: number;
  /**
   * This applies any desired settings to the Color Buffer.
   * Some noteable defaults this system sets:
   *  - generateMipMaps is true and
   *  - premultiply alpha is true.
   */
  colorBufferSettings?: ColorBufferOptions;
  /** The actual color buffer resource generated */
  colorBuffer!: ColorBuffer;

  constructor(options: IColorBufferResource, renderer?: WebGLRenderer) {
    super(options);
    this.height = options.height;
    this.width = options.width;
    this.colorBufferSettings = options.colorBufferSettings;
    this.createColorBuffer(renderer);
  }

  /**
   * Frees up resources associated with this object. This object is no longer
   * valid after this is called and will produce undefined results if attempted
   * to use again.
   */
  destroy() {
    this.colorBuffer.destroy();
  }

  /**
   * This generates the colorBuffer object needed for this resource.
   */
  private createColorBuffer(renderer?: WebGLRenderer) {
    if (this.colorBuffer) return;

    // Establish the settings to be applied to the Color Buffer. Provide some default
    // configuration.
    this.colorBufferSettings = {
      ...this.colorBufferSettings,
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

    // Generate the color buffer
    this.colorBuffer = new ColorBuffer({
      internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA8,
      size: [width, height],
      ...this.colorBufferSettings,
    });
  }
}
