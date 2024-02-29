import React from "react";
import {
  add2,
  BasicCamera2DControllerJSX,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  copy2,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  type ISimpleEventHandlerJSX,
  LayerJSX,
  linear2,
  PromiseResolver,
  SimpleEventHandlerJSX,
  Surface,
  SurfaceJSX,
  View2D,
  ViewJSX,
} from "../../../src/index.js";
import {
  CursorCustom,
  CursorMode,
  CursorTool,
  CursorUtil,
} from "./cursor-util.js";
import { LineSegments } from "./line-segment.js";
import { StoryFn } from "@storybook/react";
import { useForceUpdate } from "../../../../util/hooks/use-force-update.js";
import { useLifecycle } from "../../../../util/hooks/use-life-cycle.js";
import type { Joint } from "./joint.js";

export default {
  title: "Deltav/DrawTool",
  args: {},
  argTypes: {},
};

export const Editor: StoryFn = (() => {
  // Hooks
  const forceUpdate = useForceUpdate();

  // Refs
  const ready = React.useRef(new PromiseResolver<Surface>());
  const camera = React.useRef<Camera2D>(new Camera2D());
  const lineProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezierProvider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const bezier2Provider = React.useRef<InstanceProvider<EdgeInstance>>(null);
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const allLines = React.useRef(new Set<LineSegments>());
  // For every edge commit that occurs, this stores a complete snapshot of every
  // edge and joint.
  const history = React.useRef<{ edges: EdgeInstance[]; joints: Joint[] }[]>(
    []
  );
  // const allBezier = React.useRef<EdgeInstance[]>([]);
  // const allBezier2 = React.useRef<EdgeInstance[]>([]);

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;

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
      CursorUtil.tool = CursorTool.PAN;
      CursorUtil.suggestMode = CursorMode.PAN_SCREEN;
      forceUpdate();
    }

    // When left CMD is down
    else if (event.key === "Meta") {
      CursorUtil.tool = CursorTool.SELECT;
      forceUpdate();
    }

    // V switches the base tool to the select tool
    else if (event.key === "v") {
      CursorUtil.tool = CursorTool.SELECT;
      CursorUtil.baseTool = CursorTool.SELECT;
      event.stopImmediatePropagation();
      event.preventDefault();
      forceUpdate();
    }

    // N switched the base tool to the line tool
    else if (event.key === "n") {
      CursorUtil.tool = CursorTool.LINE;
      CursorUtil.baseTool = CursorTool.LINE;
      forceUpdate();
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.key === " ") {
      CursorUtil.tool = CursorUtil.baseTool;
      forceUpdate();
    } else if (event.key === "Meta") {
      CursorUtil.tool = CursorUtil.baseTool;
      CursorUtil.custom = CursorCustom.NONE;
      forceUpdate();
    }
  }

  function commitEdge(edge: LineSegments) {}

  const surfaceHandlers: ISimpleEventHandlerJSX["handlers"] = {
    handleMouseMove(e) {
      CursorUtil.updatePosition(e);
      // Always reset the custom cursor and allow the log flow to repick
      // it every movement.
      CursorUtil.custom = CursorCustom.NONE;

      // When using the select tool, moving the mouse around will change
      // the tools target edge as well as the tool's mode depending which
      // part of the edge it is relative to.
      switch (CursorUtil.tool) {
        case CursorTool.SELECT: {
          CursorUtil.getNearest(5, Array.from(allLines.current));

          if (CursorUtil.nearestEdge) {
            const { line, t } = CursorUtil.nearestEdge;
            const start = line.length * t;
            const end = line.length * (1 - t);

            if (start < 10 || end < 10) {
              CursorUtil.custom = CursorCustom.LINE_END;
              CursorUtil.suggestMode = CursorMode.MOVE_END;
            } else {
              CursorUtil.custom = CursorCustom.LINE_CURVE;
              CursorUtil.suggestMode = CursorMode.MOVE_CURVE;
            }
          } else {
            CursorUtil.suggestMode = CursorMode.DRAW_SELECTION_BOX;
          }
          forceUpdate();
          break;
        }

        case CursorTool.LINE: {
          CursorUtil.suggestMode = CursorMode.DRAW_LINE;
          break;
        }

        case CursorTool.PAN: {
          CursorUtil.suggestMode = CursorMode.PAN_SCREEN;
          break;
        }
      }
    },

    handleMouseDown(e) {
      CursorUtil.updatePosition(e);
      // Record the start of the mouse down interaction which is used
      // for many different operations
      CursorUtil.startDown[0] = CursorUtil.worldPosition;

      switch (CursorUtil.suggestMode) {
        case CursorMode.PAN_SCREEN:
          CursorUtil.executeMode = CursorMode.PAN_SCREEN;
          break;

        case CursorMode.MOVE_END:
          if (!CursorUtil.nearestEdge) return;
          CursorUtil.selectedEdge = CursorUtil.nearestEdge.line;

          if (CursorUtil.nearestEdge.t > 0.5) {
            CursorUtil.selectedEnd = "end";
          } else {
            CursorUtil.selectedEnd = "start";
          }
          CursorUtil.executeMode = CursorMode.MOVE_END;
          break;

        case CursorMode.MOVE_CURVE: {
          if (!CursorUtil.nearestEdge) return;
          const edge = CursorUtil.nearestEdge.line.edge;
          CursorUtil.selectedEdge = CursorUtil.nearestEdge.line;
          CursorUtil.executeMode = CursorMode.MOVE_CURVE;

          // Switch to bezier rendering if the edge is currently a line
          if (lineProvider.current?.has(edge)) {
            CursorUtil.nearestEdge.line.type = EdgeType.BEZIER;
            CursorUtil.nearestEdge.line.edge.control[0] = linear2(
              edge.start,
              edge.end,
              0.5
            );
            lineProvider.current.remove(edge);
            bezierProvider.current?.add(edge);
          }

          CursorUtil.startDown[1] = copy2(
            CursorUtil.nearestEdge.line.edge.control[0]
          );
          break;
        }

        case CursorMode.DRAW_LINE:
          CursorUtil.executeOnDragMode = CursorMode.DRAW_LINE;
          break;
      }
    },

    handleDrag(e) {
      CursorUtil.updatePosition(e, true);

      // This will execute once when the new execution mode has finally
      // begun.
      CursorUtil.willStartDragMode(() => {
        switch (CursorUtil.executeMode) {
          case CursorMode.DRAW_LINE:
            if (!lineProvider.current) return;
            CursorUtil.selectedEdge = new LineSegments(
              lineProvider.current?.add(
                new EdgeInstance({
                  start: CursorUtil.worldPosition,
                  end: CursorUtil.worldPosition,
                  thickness: [5, 5],
                  startColor: [1, 1, 1, 1],
                  endColor: [1, 1, 1, 1],
                })
              ),
              EdgeType.LINE
            );

            allLines.current.add(CursorUtil.selectedEdge);
            break;

          case CursorMode.MOVE_END:
            // We begin the operation immediately on mouse down for better UX
            break;

          case CursorMode.MOVE_CURVE:
            // We begin the operation immediately on mouse down for better UX
            break;
        }
      });

      // Handle regular drag updates for the execution mode.
      switch (CursorUtil.executeMode) {
        case CursorMode.DRAW_LINE:
          if (!CursorUtil.selectedEdge) return;
          CursorUtil.selectedEdge.edge.end = CursorUtil.worldPosition;
          break;

        case CursorMode.MOVE_END:
          if (!CursorUtil.selectedEdge) return;
          CursorUtil.selectedEdge.edge[CursorUtil.selectedEnd] =
            CursorUtil.worldPosition;
          CursorUtil.selectedEdge?.updateSegments();
          CursorUtil.custom = CursorCustom.LINE_END;
          break;

        case CursorMode.MOVE_CURVE: {
          if (!CursorUtil.selectedEdge) return;
          const edge = CursorUtil.selectedEdge.edge;
          const controls = edge.control.slice(0);
          controls[0] = add2(
            CursorUtil.startDown[1],
            add2(CursorUtil.dragDelta.direction, CursorUtil.dragDelta.direction)
          );
          edge.control = controls;
          CursorUtil.custom = CursorCustom.LINE_CURVE;
          CursorUtil.selectedEdge?.updateSegments();
          break;
        }
      }
    },

    handleMouseUp(e) {
      CursorUtil.updatePosition(e);

      switch (CursorUtil.executeMode) {
        case CursorMode.DRAW_LINE:
          CursorUtil.selectedEdge?.updateSegments();
          CursorUtil.selectedEdge = null;
          break;

        case CursorMode.MOVE_END:
          CursorUtil.selectedEdge?.updateSegments();
          CursorUtil.selectedEdge = null;
          break;
      }

      CursorUtil.executeMode = CursorMode.NONE;
      forceUpdate();
    },
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
      containerProps={{
        style: {
          cursor: CursorUtil.getCSSCursor(),
        },
      }}
    >
      <BasicCamera2DControllerJSX
        options={{
          camera: camera.current,

          scaleFilter: (scale) => {
            if (CursorUtil.suggestMode !== CursorMode.PAN_SCREEN) {
              return [0, 0, 0];
            }
            return scale;
          },

          panFilter(offset) {
            if (CursorUtil.executeMode !== CursorMode.PAN_SCREEN) {
              return [0, 0, 0];
            }
            return offset;
          },
        }}
      />
      <SimpleEventHandlerJSX handlers={surfaceHandlers} />
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
      <LayerJSX type={CircleLayer} providerRef={circleProvider} config={{}} />
    </SurfaceJSX>
  );
}).bind({});
