import React from "react";
import { type IMouseInteraction, type Vec2 } from "../../../src";
import { LineSegments } from "./line-segment";
export declare enum CursorMode {
    MOVE_END = "move_end",
    MOVE_CURVE = "move_curve",
    DRAW_LINE = "draw_line",
    PAN_SCREEN = "pan_screen",
    DRAW_SELECTION_BOX = "draw_selection_box",
    NONE = "none"
}
export declare enum CursorTool {
    LINE = "line",
    SELECT = "select",
    PAN = "pan"
}
export declare enum CursorCustom {
    LINE_END = "line-end",
    LINE_CURVE = "line-curve",
    NONE = "none"
}
/**
 * This contains utility functions mostly centered around managing cursor state
 * and making selections amongst the edges with the cursor.
 */
export declare class CursorUtil {
    static screenPosition: Vec2;
    static worldPosition: Vec2;
    /**
     * As position is updated during drag events, this calculates the vector
     * information from the mouse down to the current position.
     */
    static dragDelta: {
        direction: Vec2;
        length: number;
    };
    /**
     * This is the suggested mode for the cursor. Usually determined by moving
     * the mouse around with a selected tool type
     */
    static suggestMode: CursorMode;
    /**
     * This is a mode that will change the execution mode after a small delta of
     * dragging begins.
     */
    static executeOnDragMode: CursorMode | null;
    /**
     * This is the amount the mouse must move without a mouse up to trigger the
     * executeOnDragMode transfer and callback to happen.
     */
    static executeOnDragModeThreshold: number;
    /**
     * This is the mode that is picked for execution as the user commits via mouse
     * down then dragging around.
     */
    static executeMode: CursorMode;
    /**
     * Current tool in use by the Cursor
     */
    static tool: CursorTool;
    /**
     * This is the tool the cursor reverts to after certain rapid access hotkeys
     * are used.
     */
    static baseTool: CursorTool;
    /**
     * The custom cursor icon to use which will cause the system cursor to hide
     */
    static custom: CursorCustom;
    /**
     * Stores where the mouse was pressed down. This can have additional vectors
     * stored for additional start points required. The first vector is always the
     * mouse start down position.
     */
    static startDown: Vec2[];
    /** Stores the nearest edge next to the cursor */
    static nearestEdge: {
        line: LineSegments;
        segment: [Vec2, Vec2, LineSegments, boolean];
        t: number;
    } | null;
    /** Stores an edge that is the target of future operations */
    static selectedEdge: LineSegments | null;
    /**
     * For some execution modes, this is populated with the end of an edge being
     * interacted with
     */
    static selectedEnd: "start" | "end";
    /**
     * This is a helper that manages a handler for when a mode was suggested via
     * executeOnDragMode. When enough of a delta has taken place to begin the new
     * mode, the callback will be called with the mode applied to the executeMode
     * property.
     */
    static willStartDragMode(cb: Function): void;
    /**
     * Gets the nearest edge from the cursor within a specified range. If an edge
     * isn't within range this will return null.
     *
     * This also provides the t factor to show where in the edge the cursor is
     * nearest.
     */
    static getNearest(range: number, edges: LineSegments[]): [LineSegments["segments"][number], number] | null;
    /**
     * Returns the CSS style cursor based on the current tool state of the cursor.
     * If a custom cursor is specified, this will hide the system cursor so a
     * custom cursor can be rendered.
     */
    static getCSSCursor(): React.CSSProperties["cursor"];
    static updatePosition(e: IMouseInteraction, isDrag?: boolean): void;
}
