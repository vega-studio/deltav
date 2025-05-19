import React from "react";

import { useLifecycle } from "../../../../../util/hooks/use-life-cycle.js";
import { EventManager } from "../../../event-management/event-manager.js";
import { QueuedEventHandler } from "../../../event-management/queued-event-handler.js";
import { CustomTag } from "../custom-tag.js";
import { SurfaceJSXType } from "../group-surface-children.js";
import { IEventManagerJSX } from "./as-event-manager.js";

export interface IQueuedEventHandlerJSX extends Partial<IEventManagerJSX> {
  /** Specified handlers you wish to implement */
  handlers: Partial<EventManager>;
  /**
   * When set to true, ALL events will be stored and broadcasted upon dequeuing
   * of the events. Conversely, when false, only the last event of a given event
   * type will be preserved for broadcast.
   */
  preserveEvents?: boolean;
}

/**
 * Provides a simple event handler to be used by the surface
 */
export const QueuedEventHandlerJSX = (props: IQueuedEventHandlerJSX) => {
  useLifecycle({
    didMount() {
      props.resolver?.resolve(
        new QueuedEventHandler(props.handlers, props.preserveEvents)
      );
    },
  });

  return <CustomTag tagName="QueuedEventHandler" {...props} />;
};

QueuedEventHandlerJSX.surfaceJSXType = SurfaceJSXType.EVENT_MANAGER;
