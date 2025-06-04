import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import { GLSettings } from "../../../gl/gl-settings.js";
import { WebGLStat } from "../../../gl/webgl-stat.js";
import {
  createTexture,
  IRenderTextureResource,
} from "../../../resources/index.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";

export interface IFloatTexturePropsJSX extends Partial<IResourceJSX> {
  /**
   * Resource name for debugging mostly. Maps to resource "key" in the deltav
   * resource.
   */
  name?: string;

  /**
   * The number of channels that can carry a unique value. This will be between
   * 1 and 4.
   */
  channels?: 1 | 2 | 3 | 4;

  /**
   * If true, the texture will be forced to use half precision floats. Some
   * hardware only supports half precision floats.
   */
  forceHalfPrecision?: boolean;

  /**
   * The data to apply to the GPU for the image. If no data is to be uploaded to
   * the texture, use width and height object.
   */
  data?: Float32Array;
}

/**
 * Props for TextureJSX
 */
type IFloatTextureJSX = IFloatTexturePropsJSX &
  Omit<IRenderTextureResource, "type" | "key">;

const channelsToSize = {
  1: GLSettings.Texture.TexelDataType.R32F,
  2: GLSettings.Texture.TexelDataType.RG32F,
  3: GLSettings.Texture.TexelDataType.RGB32F,
  4: GLSettings.Texture.TexelDataType.RGBA32F,
};

const channelsToHalfSize = {
  1: GLSettings.Texture.TexelDataType.R16F,
  2: GLSettings.Texture.TexelDataType.RG16F,
  3: GLSettings.Texture.TexelDataType.RGB16F,
  4: GLSettings.Texture.TexelDataType.RGBA16F,
};

/**
 * This is aa simple abstraction of the TextureJSX item to create a texture
 * intended for float data which is commonly used for anything that requires
 * higher values and higher precision than simple color data.
 *
 * NOTE: This will automatically set the texture to a float size that is MOST
 * COMPATIBLE with the indicated hardware (will have read AND write support). If
 * you need to force a Texture with specific sizing and you know how it will
 * behave with your intended hardware, use TextureJSX directly.
 */
export const FloatTextureJSX = (props: IFloatTextureJSX) => {
  useLifecycle({
    didMount() {
      const { channels = 4 } = props;

      let channelSize: GLSettings.Texture.TexelDataType =
        channelsToSize[channels];
      let type = GLSettings.Texture.SourcePixelFormat.Float;

      // If the hardware is not capable of reading and writing full float
      // textures, we will force half precision.
      if (
        !WebGLStat.FLOAT_TEXTURE_WRITE.full ||
        !WebGLStat.FLOAT_TEXTURE_READ.full
      ) {
        if (
          !WebGLStat.FLOAT_TEXTURE_READ.half ||
          !WebGLStat.FLOAT_TEXTURE_WRITE.half
        ) {
          console.warn(
            "This environment does not support Float textures in a fully useable (read/write) capacity. The program may experience issues on this device."
          );
        } else {
          console.warn(
            "This environment only supports half float. Precision may be lost causing unexpected artifacts."
          );
        }

        channelSize = channelsToHalfSize[channels];
        type = GLSettings.Texture.SourcePixelFormat.HalfFloat;
      }

      if ((props.data?.length ?? 0) < props.width * props.height * channels) {
        console.warn(
          "The data provided is not the same size as the width and height provided. This will cause undefined behavior."
        );
      }

      props.resolver?.resolve(
        createTexture({
          key: props.name,
          height: props.height,
          width: props.width,
          textureSettings: {
            ...props.textureSettings,
            internalFormat: channelSize,
            type,
            format: GLSettings.Texture.TexelDataType.RGBA,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
            wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
            wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
            data: props.data
              ? {
                  width: props.width,
                  height: props.height,
                  buffer: props.data,
                }
              : undefined,
          },
        })
      );
    },
  });

  return <CustomTag tagName="FloatTexture" {...props} />;
};

FloatTextureJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
