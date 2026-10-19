/**
 * In-page handles the interaction fixtures register on `window`, so the
 * node-side tests in `test/interaction/` can mutate instances and read
 * recorded events through `page.evaluate`. Each handle is owned by its
 * fixture: installed on mount, deleted on unmount. Keep this file free of
 * runtime imports; node tests import it type-only.
 */

/** 0–1 RGBA colour. */
export type RGBA01 = [number, number, number, number];

/** A rectangle instance description, world units, anchored top-left. */
export interface RectSpec {
  position: [number, number];
  size: [number, number];
  color: RGBA01;
}

/** Easing state of one instance's `location` attribute, read in the page. */
export interface EasingState {
  /** surface.frameMetrics.currentTime of the last drawn frame, ms */
  now: number;
  /** EasingProps.startTime (already includes the delay), ms */
  startTime: number;
  duration: number;
  start: number[];
  end: number[];
}

/** `window.__dvInteractionRects` — test/fixtures/interaction/rects.fixture.tsx */
export interface RectsHandle {
  /** Adds a rectangle under a test id. */
  add(id: string, spec: RectSpec): void;
  /** Changes properties of the rectangle with the given id. */
  update(id: string, spec: Partial<RectSpec>): void;
  /** Removes the rectangle with the given id. */
  remove(id: string): void;
  /**
   * Adds `count` rectangles of `size` on a grid of `cell` px cells, starting
   * at `origin`, row-major across `columns` columns. Ids are `${prefix}${i}`.
   */
  addGrid(
    prefix: string,
    count: number,
    opts: {
      origin: [number, number];
      columns: number;
      cell: number;
      size: [number, number];
      color: RGBA01;
    }
  ): void;
  /** Removes every rectangle. */
  removeAll(): void;
  /** Number of rectangles in the provider. */
  count(): number;
  /**
   * Easing state of a rectangle's `location` attribute, plus a row of canvas
   * pixels read in the same task (so both describe the same frame).
   */
  easingWithRow(
    id: string,
    row: number
  ): { easing: EasingState | null; row: number[]; width: number };
}

/** One instance callback recorded by the picking fixture. */
export interface PickEvent {
  type: "over" | "out" | "click" | "down" | "up";
  /** Test ids of the picked instances */
  ids: string[];
}

/** `window.__dvInteractionPicking` — picking.fixture.tsx */
export interface PickingHandle {
  events: PickEvent[];
  clear(): void;
}

/** One camera state read from the camera fixture. */
export interface CameraState {
  offset: [number, number];
  scale: [number, number];
}

/** `window.__dvInteractionCamera` — camera.fixture.tsx */
export interface CameraHandle {
  camera(): CameraState;
}

/** One SimpleEventHandler call recorded by the events fixture. */
export interface ViewEvent {
  type: "down" | "move" | "up" | "drag";
  /** e.screen.position */
  screen: [number, number];
  /** e.target.position (view space of the top-most view under the pointer) */
  target: [number, number];
  /** e.target.view.id */
  view: string;
  /** e.start.position, view space */
  start: [number, number];
  /** e.target.view.projection.screenToWorld(e.screen.position) */
  world: [number, number];
}

/** `window.__dvInteractionEvents` — events.fixture.tsx */
export interface EventsHandle {
  events: ViewEvent[];
  clear(): void;
}

declare global {
  interface Window {
    __dvInteractionRects?: RectsHandle;
    __dvInteractionPicking?: PickingHandle;
    __dvInteractionCamera?: CameraHandle;
    __dvInteractionEvents?: EventsHandle;
  }
}
