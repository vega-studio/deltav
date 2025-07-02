import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import type { GLSettings } from "../../../gl/index.js";
import {
  createColorBuffer,
  type IColorBufferResource,
} from "../../../resources/color-buffer/color-buffer-resource.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IResourceJSX } from "./as-resource.js";

export interface IDepthBufferPropsJSX extends Partial<IResourceJSX> {
  /**
   * The identifier for the resource.
   */
  name?: string;
}

/**
 * Props for TextureJSX
 */
type IDepthBufferJSX = IDepthBufferPropsJSX &
  Omit<IColorBufferResource, "type" | "key" | "colorBufferSettings"> & {
    config: Omit<
      NonNullable<IColorBufferResource["colorBufferSettings"]>,
      "internalFormat"
    > & {
      internalFormat: GLSettings.RenderTarget.DepthBufferFormat;
    };
  };

/**
 * Generates a Buffer Resource that can be used by the name provided. This is
 * specialized for depth buffers.
 */
export const DepthBufferJSX = (props: IDepthBufferJSX) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(
        createColorBuffer({
          key: props.name,
          height: props.height,
          width: props.width,
          colorBufferSettings: props.config,
        })
      );
    },
  });

  return <CustomTag tagName="ColorBuffer" {...props} />;
};

DepthBufferJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
