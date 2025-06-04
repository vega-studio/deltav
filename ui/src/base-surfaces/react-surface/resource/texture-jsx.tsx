import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import {
  createTexture,
  IRenderTextureResource,
} from "../../../resources/index.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";

export interface ITexturePropsJSX extends Partial<IResourceJSX> {
  /**
   * The identifier for the resource.
   */
  name?: string;
}

/**
 * Props for TextureJSX
 */
type ITextureJSX = ITexturePropsJSX &
  Omit<IRenderTextureResource, "type" | "key">;

/**
 * Generates a texture Resource that can be used by the name provided.
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
