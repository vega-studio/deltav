import React from "react";
import {
  createTexture,
  IRenderTextureResource,
} from "../../../resources/index.js";
import { CustomTag } from "../custom-tag.js";
import { IResourceJSX } from "./as-resource.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";

export interface ITexturePropsJSX extends Partial<IResourceJSX> {
  /**
   * Resource name for debugging mostly. Maps to resource "key" in the deltav
   * resource.
   */
  name?: string;
}

/**
 * Props for TextureJSX
 */
type ITextureJSX = ITexturePropsJSX &
  Omit<IRenderTextureResource, "type" | "key">;

/**
 * Provides a simple event handler to be used by the surface
 */
export const TextureJSX = (props: ITextureJSX) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(
        createTexture({
          key: props.name,
          height: props.height,
          width: props.width,
          textureSettings: props.textureSettings,
        })
      );
    },
  });

  return <CustomTag tagName="Texture" {...props} />;
};

TextureJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
