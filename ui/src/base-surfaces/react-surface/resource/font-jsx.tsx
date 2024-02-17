import React from "react";
import { createFont, IFontResourceOptions } from "../../../resources/index.js";
import { CustomTag } from "../custom-tag.js";
import { IResourceJSX } from "./as-resource.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";

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
  useLifecycle({
    didMount() {
      props.resolver?.resolve(
        createFont({
          key: props.name,
          fontSource: props.fontSource,
          characterFilter: props.characterFilter,
          dynamic: props.dynamic,
          fontMap: props.fontMap,
          fontMapSize: props.fontMapSize,
        })
      );
    },
  });

  return <CustomTag tagName="Font" {...props} />;
};

FontJSX.defaultProps = {
  surfaceJSXType: SurfaceJSXType.RESOURCE,
} as IFontJSX;
