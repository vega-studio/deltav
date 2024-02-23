import React from "react";
import {
  BasicCamera2DControllerJSX,
  Camera2D,
  ClearFlags,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerJSX,
  PromiseResolver,
  SimpleEventHandlerJSX,
  Surface,
  SurfaceJSX,
  vec2,
  type Vec2,
  View2D,
  ViewJSX,
} from "../../../src/index.js";
import { StoryFn } from "@storybook/react";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle.js";

export default {
  title: "Deltav/DrawTool",
  args: {},
  argTypes: {},
};

export const Editor: StoryFn = (() => {
  const camera = React.useRef<Camera2D>(new Camera2D());
  const lineProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezierProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezier2Provider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const allLines = React.useRef<EdgeInstance[]>([]);
  const allBezier = React.useRef<EdgeInstance[]>([]);
  const allBezier2 = React.useRef<EdgeInstance[]>([]);
  const ready = React.useRef(new PromiseResolver<Surface>());
  const shouldPan = React.useRef(false);

  const focusedEdge = React.useRef<EdgeInstance | null>(null);

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (
        !lineProvider.current ||
        !bezierProvider.current ||
        !bezier2Provider.current
      ) {
        return;
      }

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    },
  });

  function handleKeyDown(event: KeyboardEvent) {
    // When space bar is down
    if (event.key === " ") {
      shouldPan.current = true;
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === " ") {
      shouldPan.current = false;
    }
  }

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <BasicCamera2DControllerJSX
        options={{
          camera: camera.current,
          scaleFilter: (scale, _view, _views) => {
            if (!shouldPan.current) return [0, 0, 0];
            return scale;
          },
          panFilter(offset, _view, _allViews) {
            if (!shouldPan.current) return [0, 0, 0];
            return offset;
          },
        }}
      />
      <SimpleEventHandlerJSX
        handlers={{
          handleMouseDown(e) {
            if (shouldPan.current) return;
            if (!lineProvider.current) return;
            const world: Vec2 = vec2(
              e.target.view.projection.screenToWorld(e.target.position)
            );
            focusedEdge.current = lineProvider.current?.add(
              new EdgeInstance({
                start: world,
                end: world,
                thickness: [5, 5],
                startColor: [1, 1, 1, 1],
                endColor: [1, 1, 1, 1],
              })
            );

            allLines.current.push(focusedEdge.current);
          },

          handleDrag(e) {
            if (!focusedEdge.current) return;
            const world: Vec2 = vec2(
              e.target.view.projection.screenToWorld(e.target.position)
            );
            focusedEdge.current.end = world;
          },

          handleMouseUp() {
            focusedEdge.current = null;
          },
        }}
      />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        type={EdgeLayer}
        providerRef={lineProvider}
        config={{
          type: EdgeType.LINE,
        }}
      />
      <LayerJSX
        type={EdgeLayer}
        providerRef={bezierProvider}
        config={{
          type: EdgeType.BEZIER,
        }}
      />
      <LayerJSX
        type={EdgeLayer}
        providerRef={bezier2Provider}
        config={{
          type: EdgeType.BEZIER2,
        }}
      />
    </SurfaceJSX>
  );
}).bind({});
