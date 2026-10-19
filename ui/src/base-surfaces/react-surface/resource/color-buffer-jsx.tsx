import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import type { GLSettings } from "../../../gl/index.js";
import {
  createColorBuffer,
  type IColorBufferResource,
} from "../../../resources/color-buffer/color-buffer-resource.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { SurfaceContext } from "../surface-jsx.js";
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
  Omit<IColorBufferResource, "type" | "key" | "colorBufferSettings"> & {
    config: Omit<
      NonNullable<IColorBufferResource["colorBufferSettings"]>,
      "internalFormat"
    > & {
      internalFormat: GLSettings.RenderTarget.ColorBufferFormat;
    };
  };

/**
 * Generates a texture Resource that can be used by the name provided.
 */
export const ColorBufferJSX = (props: IColorBufferJSX) => {
  const surfaceContext = React.useContext(SurfaceContext);

  useLifecycle({
    didMount() {
      const resource = createColorBuffer({
        key: props.name,
        height: props.height,
        width: props.width,
        colorBufferSettings: props.config,
      });

      props.resolver?.resolve(resource);

      // Stop the surface from building this resource once unmounted.
      return () => surfaceContext?.disposeResource?.(resource);
    },
  });

  return <CustomTag tagName="ColorBuffer" {...props} />;
};

ColorBufferJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
