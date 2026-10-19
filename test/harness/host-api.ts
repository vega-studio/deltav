/**
 * Types shared by the node side of the harness (jest tests driving the page
 * through playwright) and the browser side (the fixture host page). Keep this
 * file free of runtime imports: it is loaded in both environments.
 */

/** RGBA colour, each channel 0–255. */
export type RGBA255 = [number, number, number, number];

/** A rectangle in canvas pixel coordinates, origin top-left. */
export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Props passed to a fixture component. Must be JSON serialisable. */
export type FixtureProps = Record<string, unknown>;

/** Result of `readPixels`: row-major RGBA bytes, origin top-left. */
export interface PixelBlock {
  width: number;
  height: number;
  /** width * height * 4 bytes, rows top to bottom */
  data: number[];
}

/** The API the host page installs as `window.__deltav`. */
export interface DeltavHostAPI {
  /** Names of every registered fixture. */
  fixtures(): string[];
  /**
   * Mounts the named fixture. Resolves once the fixture's surface signalled
   * `ready` (fixtures without a surface resolve immediately) and two frames
   * have drawn.
   */
  mount(name: string, props?: FixtureProps): Promise<void>;
  /** Re-renders the mounted fixture with new props, then waits two frames. */
  update(props: FixtureProps): Promise<void>;
  /** Unmounts the React root and waits two frames. */
  unmount(): Promise<void>;
  /** Waits for n animation frames. */
  waitFrames(n: number): Promise<void>;
  /**
   * Copies the fixture's canvas into a 2D canvas and returns the RGBA bytes of
   * the requested rect, in canvas pixel coordinates with the origin top-left.
   */
  readPixels(x: number, y: number, w: number, h: number): PixelBlock;
  /** Size in pixels of the fixture's canvas. */
  canvasSize(): { width: number; height: number };
}

declare global {
  interface Window {
    __deltav?: DeltavHostAPI;
  }
}

/**
 * Leak detector (test/harness/leaks-page.ts) — the kinds of resource it
 * counts. GL object kinds count live objects created through the
 * instrumented context methods and not yet deleted; `contexts` counts WebGL
 * contexts seen and not released through `WEBGL_lose_context` or a
 * `webglcontextlost` event; `canvases` counts `<canvas>` elements in the
 * document; `listeners` counts window and document event listeners; the
 * `frame*` kinds are `frameCommandStats()` of `ui/src/util/frame.ts`.
 */
export const RESOURCE_KINDS = [
  "buffers",
  "textures",
  "framebuffers",
  "renderbuffers",
  "programs",
  "shaders",
  "vertexArrays",
  "queries",
  "samplers",
  "transformFeedbacks",
  "contexts",
  "canvases",
  "listeners",
  "frameAnimationLoops",
  "frameNextFrame",
  "frameQueued",
] as const;

export type ResourceKind = (typeof RESOURCE_KINDS)[number];

/** Live count of every resource kind at one moment. */
export type ResourceCounts = Record<ResourceKind, number>;

/**
 * A snapshot: the counts plus `seq`, the creation cursor at that moment.
 * Everything created after the snapshot has a larger `seq`, which is how a
 * leak report finds the objects created since a baseline.
 */
export type ResourceSnapshot = ResourceCounts & { seq: number };

/** One live tracked resource. */
export interface LeakEntry {
  /** Creation order, compared with `ResourceSnapshot.seq` */
  seq: number;
  /** What it is, e.g. `buffer (context #2)` or `window:resize` */
  label: string;
  /** Trimmed creation stack (`new Error().stack`) */
  stack: string;
}

/** Live entries per kind. Canvases and frame commands carry no entries. */
export type LeakDetails = Partial<Record<ResourceKind, LeakEntry[]>>;

/** The API the leak instrument installs as `window.__deltavLeaks`. */
export interface DeltavLeaksAPI {
  /** Current counts and creation cursor. */
  snapshot(): ResourceSnapshot;
  /** Live entries per kind; with `since`, only those created after it. */
  details(since?: number): LeakDetails;
}

declare global {
  interface Window {
    __deltavLeaks?: DeltavLeaksAPI;
  }
}
