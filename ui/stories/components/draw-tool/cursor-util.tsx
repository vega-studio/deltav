import CursorEdgePointer from "./edge-pointer.svg";
import CursorEndPointer from "./end-pointer.svg";
import React from "react";
import {
  type IMouseInteraction,
  length2,
  subtract2,
  vec2,
  type Vec2,
} from "../../../src";
import { LineSegments } from "./line-segment";
import { LineSweep } from "./line-sweep";

export enum CursorMode {
  MOVE_END = "move_end",
  MOVE_CURVE = "move_curve",
  DRAW_LINE = "draw_line",
  PAN_SCREEN = "pan_screen",
  DRAW_SELECTION_BOX = "draw_selection_box",
  NONE = "none",
}

export enum CursorTool {
  LINE = "line",
  SELECT = "select",
  PAN = "pan",
}

export enum CursorCustom {
  LINE_END = "line-end",
  LINE_CURVE = "line-curve",
  NONE = "none",
}

/**
 * This contains utility functions mostly centered around managing cursor state
 * and making selections amongst the edges with the cursor.
 */
export class CursorUtil {
  static screenPosition: Vec2 = [0, 0];
  static worldPosition: Vec2 = [0, 0];
  /**
   * As position is updated during drag events, this calculates the vector
   * information from the mouse down to the current position.
   */
  static dragDelta = {
    direction: [0, 0] as Vec2,
    length: 0,
  };
  /**
   * This is the suggested mode for the cursor. Usually determined by moving
   * the mouse around with a selected tool type
   */
  static suggestMode = CursorMode.NONE;
  /**
   * This is a mode that will change the execution mode after a small delta of
   * dragging begins.
   */
  static executeOnDragMode: CursorMode | null = null;
  /**
   * This is the amount the mouse must move without a mouse up to trigger the
   * executeOnDragMode transfer and callback to happen.
   */
  static executeOnDragModeThreshold = 2;
  /**
   * This is the mode that is picked for execution as the user commits via mouse
   * down then dragging around.
   */
  static executeMode = CursorMode.NONE;
  /**
   * Current tool in use by the Cursor
   */
  static tool = CursorTool.LINE;
  /**
   * This is the tool the cursor reverts to after certain rapid access hotkeys
   * are used.
   */
  static baseTool = CursorTool.LINE;
  /**
   * The custom cursor icon to use which will cause the system cursor to hide
   */
  static custom = CursorCustom.NONE;
  /**
   * Stores where the mouse was pressed down. This can have additional vectors
   * stored for additional start points required. The first vector is always the
   * mouse start down position.
   */
  static startDown: Vec2[] = [[0, 0]];
  /** Stores the nearest edge next to the cursor */
  static nearestEdge: {
    line: LineSegments;
    segment: [Vec2, Vec2, LineSegments];
    t: number;
  } | null = null;

  /** Stores an edge that is the target of future operations */
  static selectedEdge: LineSegments | null = null;
  /**
   * For some execution modes, this is populated with the end of an edge being
   * interacted with
   */
  static selectedEnd: "start" | "end" = "start";

  /**
   * This is a helper that manages a handler for when a mode was suggested via
   * executeOnDragMode. When enough of a delta has taken place to begin the new
   * mode, the callback will be called with the mode applied to the executeMode
   * property.
   */
  static willStartDragMode(cb: Function) {
    // Check if we met the requirements to begin
    if (
      this.dragDelta.length > this.executeOnDragModeThreshold &&
      this.executeOnDragMode !== null
    ) {
      // Transfer the mode
      this.executeMode = this.executeOnDragMode;
      this.executeOnDragMode = null;
      // Fire the event for a one time response
      cb();
    }
  }

  /**
   * Gets the nearest edge from the cursor within a specified range. If an edge
   * isn't within range this will return null.
   *
   * This also provides the t factor to show where in the edge the cursor is
   * nearest.
   */
  static getNearest(
    range: number,
    edges: LineSegments[]
  ): [LineSegments["segments"][number], number] | null {
    // Find edges that intersects with a circle with radius "range"
    const intersections = LineSweep.lineSweepIntersectionWithCircle(
      {
        r: range,
        center: CursorUtil.worldPosition,
      },
      edges
    );

    // Now compute the nearest of the segments
    let nearest: [Vec2, Vec2, LineSegments] | null = null;
    let nearestT = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const i of intersections) {
      const line = i[2];
      // Get the start and end tvals of the segment
      const tvals = line.getSegmentT(i);
      if (!tvals) continue;
      // Get the start and end segment points based on the tvals
      // Segments generated for the LineSegments are sorted from left to right
      // to speed up line sweeps. But for this, we need them sorted by t value
      // to make these calculations more sensical
      const [distance, t] = LineSegments.distanceToPointSq(
        [line.getPoint(tvals[0]), line.getPoint(tvals[1])],
        CursorUtil.worldPosition
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = i;
        const dt = tvals[1] - tvals[0];
        nearestT = tvals[0] + dt * t;
      }
    }

    if (nearest) {
      this.nearestEdge = {
        line: nearest[2],
        segment: nearest,
        t: nearestT,
      };
      return [nearest, nearestT];
    }

    this.nearestEdge = null;
    return null;
  }

  /**
   * Returns the CSS style cursor based on the current tool state of the cursor.
   * If a custom cursor is specified, this will hide the system cursor so a
   * custom cursor can be rendered.
   */
  static getCSSCursor(): React.CSSProperties["cursor"] {
    if (this.custom !== CursorCustom.NONE) {
      let cursor = "none";

      switch (this.custom) {
        case CursorCustom.LINE_END:
          cursor = `url('${CursorEndPointer}'), auto`;
          break;

        case CursorCustom.LINE_CURVE:
          cursor = `url('${CursorEdgePointer}'), auto`;
          break;
      }

      return cursor;
    }

    switch (this.tool) {
      case CursorTool.LINE:
        return "crosshair";
      case CursorTool.SELECT:
        return "default";
      case CursorTool.PAN:
        return this.executeMode === CursorMode.PAN_SCREEN ? "grabbing" : "grab";
    }
  }

  static updatePosition(e: IMouseInteraction, isDrag = false) {
    // Update the world position based on the view's projection
    const world: Vec2 = vec2(
      e.target.view.projection.screenToWorld(e.target.position)
    );
    // Update the positions we need to track
    CursorUtil.worldPosition = world;
    CursorUtil.screenPosition = e.target.position;

    if (isDrag) {
      this.dragDelta.direction = subtract2(world, CursorUtil.startDown[0]);
      this.dragDelta.length = length2(this.dragDelta.direction);
    }
  }
}
