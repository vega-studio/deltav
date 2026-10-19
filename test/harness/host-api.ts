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
