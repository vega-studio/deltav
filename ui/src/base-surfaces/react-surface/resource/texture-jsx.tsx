import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import {
  createTexture,
  IRenderTextureResource,
} from "../../../resources/index.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { SurfaceContext } from "../surface-jsx.js";
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
  const surfaceContext = React.useContext(SurfaceContext);

  useLifecycle({
    didMount() {
      const resource = createTexture({
        key: props.name,
        height: props.height,
        width: props.width,
        textureSettings: props.textureSettings,
      });

      props.resolver?.resolve(resource);

      // Stop the surface from building this resource once unmounted.
      return () => surfaceContext?.disposeResource?.(resource);
    },
  });

  return <CustomTag tagName="Texture" {...props} />;
};

TextureJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
