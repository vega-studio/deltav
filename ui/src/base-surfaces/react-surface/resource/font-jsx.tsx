import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import { createFont, IFontResourceOptions } from "../../../resources/index.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { SurfaceContext } from "../surface-jsx.js";
import { IResourceJSX } from "./as-resource.js";

export interface IFontPropsJSX extends Partial<IResourceJSX> {
  /**
   * Resource name for debugging mostly. Maps to resource "key" in the deltav
   * resource.
   */
  name?: string;
}

/**
 * Props for FontJSX
 */
type IFontJSX = IFontPropsJSX & Omit<IFontResourceOptions, "type" | "key">;

/**
 * Provides a simple event handler to be used by the surface
 */
export const FontJSX = (props: IFontJSX) => {
  const surfaceContext = React.useContext(SurfaceContext);

  useLifecycle({
    didMount() {
      const resource = createFont({
        key: props.name,
        fontSource: props.fontSource,
        characterFilter: props.characterFilter,
        dynamic: props.dynamic,
        fontMap: props.fontMap,
        fontMapSize: props.fontMapSize,
      });

      props.resolver?.resolve(resource);

      // Stop the surface from building this resource once unmounted.
      return () => surfaceContext?.disposeResource?.(resource);
    },
  });

  return <CustomTag tagName="Font" {...props} />;
};

FontJSX.surfaceJSXType = SurfaceJSXType.RESOURCE;
