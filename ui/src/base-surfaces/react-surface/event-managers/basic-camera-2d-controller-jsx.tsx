import React from "react";
import {
  BasicCamera2DController,
  IBasicCamera2DControllerOptions,
} from "../../../2d/index.js";
import { CustomTag } from "../custom-tag.js";
import { IEventManagerJSX } from "./as-event-manager.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";

export interface IBasicCamera2DControllerJSX extends Partial<IEventManagerJSX> {
  options: IBasicCamera2DControllerOptions;
}

/**
 * Provides a simple event handler to be used by the surface
 */
export const BasicCamera2DControllerJSX = (
  props: IBasicCamera2DControllerJSX
) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(new BasicCamera2DController(props.options));
    },
  });

  return <CustomTag tagName="BasicCamera2DController" {...props} />;
};

BasicCamera2DControllerJSX.defaultProps = {
  surfaceJSXType: SurfaceJSXType.EVENT_MANAGER,
} as IBasicCamera2DControllerJSX;
