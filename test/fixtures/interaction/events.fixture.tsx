import React from "react";

import {
  AnchorType,
  Camera2D,
  ClearFlags,
  type IMouseInteraction,
  InstanceProvider,
  LayerJSX,
  RectangleInstance,
  RectangleLayer,
  SimpleEventHandlerJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import type { EventsHandle, RectSpec, RGBA01, ViewEvent } from "./handles.js";

export interface IEventsFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** The view's viewport on the canvas, pixels */
  viewport: { left: number; top: number; width: number; height: number };
  /** Camera2D offset of the view, world units */
  offset: [number, number];
  /** A marker rect drawn in the view, world units */
  rect: RectSpec;
}

/**
 * A SimpleEventHandlerJSX over one View2D that does not start at the canvas
 * origin and whose camera is offset. Every mouse down, move, drag and up it
 * receives is recorded in `window.__dvInteractionEvents.events`.
 */
const EventsFixture: React.FC<IEventsFixture> = (props) => {
  const events = React.useRef<ViewEvent[]>([]);
  const camera = React.useRef<Camera2D | null>(null);
  if (!camera.current) {
    camera.current = new Camera2D({
      offset: [props.offset[0], props.offset[1], 0],
    });
  }
  const provider = React.useRef<InstanceProvider<RectangleInstance> | null>(
    null
  );
  if (!provider.current) {
    provider.current = new InstanceProvider<RectangleInstance>();
    provider.current.add(
      new RectangleInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        position: [...props.rect.position],
        size: [...props.rect.size],
        color: [...props.rect.color],
      })
    );
  }

  const handlers = React.useMemo(() => {
    const record = (type: ViewEvent["type"]) => (e: IMouseInteraction) => {
      const world = e.target.view.projection.screenToWorld(e.screen.position);
      events.current.push({
        type,
        screen: [e.screen.position[0], e.screen.position[1]],
        target: [e.target.position[0], e.target.position[1]],
        view: e.target.view.id,
        start: [e.start.position[0], e.start.position[1]],
        world: [world[0], world[1]],
      });
    };
    return {
      handleMouseDown: record("down"),
      handleMouseMove: record("move"),
      handleMouseUp: record("up"),
      handleDrag: record("drag"),
    };
  }, []);

  React.useEffect(() => {
    const handle: EventsHandle = {
      get events() {
        return events.current;
      },
      clear() {
        events.current = [];
      },
    };
    window.__dvInteractionEvents = handle;
    return () => {
      delete window.__dvInteractionEvents;
    };
  }, []);

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <SimpleEventHandlerJSX handlers={handlers} />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: props.clear,
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          viewport: props.viewport,
        }}
      />
      <LayerJSX
        name="marker"
        type={RectangleLayer}
        providerRef={provider}
        config={{}}
      />
    </TestSurface>
  );
};

registerFixture("interaction/events", EventsFixture);
