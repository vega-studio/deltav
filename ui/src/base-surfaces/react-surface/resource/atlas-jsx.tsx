import React from "react";
import {
  createAtlas,
  IRenderTextureResource,
} from "../../../resources/index.js";
import { CustomTag } from "../custom-tag.js";
import { IResourceJSX } from "./as-resource.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";

export interface IAtlasPropsJSX extends Partial<IResourceJSX> {
  /**
   * Resource name for debugging mostly. Maps to resource "key" in the deltav
   * resource.
   */
  name?: string;
}

/**
 * Props for AtlasJSX
 */
type IAtlasJSX = IAtlasPropsJSX & Omit<IRenderTextureResource, "type" | "key">;

/**
 * Provides a simple event handler to be used by the surface
 */
export const AtlasJSX = (props: IAtlasJSX) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(
        createAtlas({
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

AtlasJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
