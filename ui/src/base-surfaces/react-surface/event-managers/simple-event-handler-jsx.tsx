import React from "react";
import { CustomTag } from "../custom-tag.js";
import { EventManager } from "../../../event-management/event-manager.js";
import { IEventManagerJSX } from "./as-event-manager.js";
import { SimpleEventHandler } from "../../../event-management/simple-event-handler.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";

export interface ISimpleEventHandlerJSX extends Partial<IEventManagerJSX> {
  handlers: Partial<EventManager>;
}

/**
 * Provides a simple event handler to be used by the surface
 */
export const SimpleEventHandlerJSX = (props: ISimpleEventHandlerJSX) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(new SimpleEventHandler(props.handlers));
    },
  });

  return <CustomTag tagName="SimpleEventHandler" {...props} />;
};

SimpleEventHandlerJSX.surfaceJSXType = SurfaceJSXType.EVENT_MANAGER;
