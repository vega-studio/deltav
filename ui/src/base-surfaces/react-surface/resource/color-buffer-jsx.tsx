import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import {
  createColorBuffer,
  type IColorBufferResource,
} from "../../../resources/color-buffer/color-buffer-resource.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";

export interface IColorBufferPropsJSX extends Partial<IResourceJSX> {
  /**
   * The identifier for the resource.
   */
  name?: string;
}

/**
 * Props for TextureJSX
 */
type IColorBufferJSX = IColorBufferPropsJSX &
  Omit<IColorBufferResource, "type" | "key">;

/**
 * Generates a texture Resource that can be used by the name provided.
 */
export const ColorBufferJSX = (props: IColorBufferJSX) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(
        createColorBuffer({
          key: props.name,
          height: props.height,
          width: props.width,
          colorBufferSettings: props.colorBufferSettings,
        })
      );
    },
  });

  return <CustomTag tagName="ColorBuffer" {...props} />;
};

ColorBufferJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
