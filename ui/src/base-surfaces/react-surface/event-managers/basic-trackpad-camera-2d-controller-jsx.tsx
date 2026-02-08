import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import {
  BasicTrackPadCamera2DController,
  type IBasicTrackPadCamera2DControllerOptions,
} from "../../../2d/index.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IEventManagerJSX } from "./as-event-manager.js";

export interface IBasicTrackPadCamera2DControllerJSX
  extends Partial<IEventManagerJSX> {
  /**
   * Initial configuration of the controller. This is only applied on creation
   * of the controller. You will have to remount this component to make changes
   * here.
   */
  config: IBasicTrackPadCamera2DControllerOptions;
  /**
   * Set to true to disable the controller from being used.
   */
  disabled?: boolean;

  /**
   * Set to true to disable drag panning. While drag panning is disabled, wheel
   * panning will still work (trackpad two-finger swipes).
   */
  disableDragPanning?: boolean;
}

/**
 * Provides a simple event handler to be used by the surface
 */
export const BasicTrackPadCamera2DControllerJSX = (
  props: IBasicTrackPadCamera2DControllerJSX
) => {
  const controller = React.useRef<BasicTrackPadCamera2DController | null>(null);

  useLifecycle({
    didMount() {
      controller.current = new BasicTrackPadCamera2DController(props.config);
      props.resolver?.resolve(controller.current);
    },
  });

  React.useEffect(() => {
    if (controller.current) {
      controller.current.disabled = props.disabled ?? false;
      controller.current.disableDragPanning = props.disableDragPanning ?? false;
    }
  }, [props.disabled, props.disableDragPanning]);

  return <CustomTag tagName="BasicTrackPadCamera2DController" {...props} />;
};

BasicTrackPadCamera2DControllerJSX.surfaceJSXType = SurfaceJSXType.EVENT_MANAGER;

// Backwards/alternate naming convenience
export type IBasicTrackPadCameraControllerJSX =
  IBasicTrackPadCamera2DControllerJSX;
export const BasicTrackPadCameraControllerJSX =
  BasicTrackPadCamera2DControllerJSX;

