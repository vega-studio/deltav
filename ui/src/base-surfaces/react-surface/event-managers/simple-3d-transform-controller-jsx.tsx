import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import {
  type ISimple3DTransformControllerOptions,
  Simple3DTransformController,
} from "../../../3d/view/simple-3d-transform-controller.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IEventManagerJSX } from "./as-event-manager.js";

export interface ISimple3DTransformControllerJSX
  extends Partial<IEventManagerJSX> {
  config: ISimple3DTransformControllerOptions;
}

/**
 * Provides a simple event handler to be used by the surface
 */
export const Simple3DTransformControllerJSX = (
  props: ISimple3DTransformControllerJSX
) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(new Simple3DTransformController(props.config));
    },
  });

  return <CustomTag tagName="BasicCamera2DController" {...props} />;
};

Simple3DTransformControllerJSX.surfaceJSXType = SurfaceJSXType.EVENT_MANAGER;
