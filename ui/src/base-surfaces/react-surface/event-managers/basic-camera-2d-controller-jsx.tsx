import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import {
  BasicCamera2DController,
  IBasicCamera2DControllerOptions,
} from "../../../2d/index.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IEventManagerJSX } from "./as-event-manager.js";

export interface IBasicCamera2DControllerJSX extends Partial<IEventManagerJSX> {
  /**
   * Initial configuration of the controller. This is only applied on creation
   * of the controller. You will have to remount this component to make changes
   * here.
   */
  config: IBasicCamera2DControllerOptions;
  /**
   * Set to true to disable the controller from being used.
   */
  disabled?: boolean;

  /**
   * Set to true to disable drag panning. While drag panning is disabled, wheel
   * panning will still work if wheelShouldScroll is true.
   */
  disableDragPanning?: boolean;
}

/**
 * Provides a simple event handler to be used by the surface
 */
export const BasicCamera2DControllerJSX = (
  props: IBasicCamera2DControllerJSX
) => {
  const controller = React.useRef<BasicCamera2DController | null>(null);

  useLifecycle({
    didMount() {
      controller.current = new BasicCamera2DController(props.config);
      props.resolver?.resolve(controller.current);
    },
  });

  React.useEffect(() => {
    if (controller.current) {
      controller.current.disabled = props.disabled ?? false;
      controller.current.disableDragPanning = props.disableDragPanning ?? false;
    }
  }, [props.disabled, props.disableDragPanning]);

  return <CustomTag tagName="BasicCamera2DController" {...props} />;
};

BasicCamera2DControllerJSX.surfaceJSXType = SurfaceJSXType.EVENT_MANAGER;
