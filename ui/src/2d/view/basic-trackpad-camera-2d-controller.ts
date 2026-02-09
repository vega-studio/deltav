import {
  BasicCamera2DController,
  type IBasicCamera2DControllerOptions,
} from "./basic-camera-2d-controller.js";
import type { IMouseInteraction } from "../../event-management/types.js";

/**
 * Options for the TrackPad camera controller.
 *
 * This is intentionally the same shape as `IBasicCamera2DControllerOptions`
 * so it can be swapped in with minimal changes.
 */
export interface IBasicTrackPadCamera2DControllerOptions extends IBasicCamera2DControllerOptions {}

/**
 * Camera controller specialized for trackpads:
 * - Click + drag pans (same as BasicCamera2DController)
 * - Two finger swipe pans via wheel events
 * - Pinch-to-zoom uses the browser's ctrl+wheel convention on macOS trackpads
 *
 * Internally this is the BasicCamera2DController behavior with `wheelShouldScroll`
 * enabled by default.
 */
export class BasicTrackPadCamera2DController extends BasicCamera2DController {
  /**
   * If provided, forces wheel behavior:
   * - true: wheel pans (unless ctrl+wheel pinch)
   * - false: wheel zooms (ctrl+wheel pinch still uses pinch scaling)
   *
   * If undefined, wheel behavior is inferred per-event:
   * - trackpad-like wheel (pixel deltas) pans
   * - mouse wheel (line/page deltas) zooms
   */
  private wheelShouldScrollMode?: boolean;

  constructor(options: IBasicTrackPadCamera2DControllerOptions) {
    super(options);
    this.wheelShouldScrollMode = options.wheelShouldScroll;
  }

  /**
   * Wheel behavior specialized for trackpads:
   * - Two-finger swipes emit wheel events with pixel deltas → pan
   * - Pinch-to-zoom emits ctrl+wheel → zoom (using pinch scaling)
   * - Traditional mouse wheels usually emit line/page deltas → zoom
   */
  override handleWheel(e: IMouseInteraction) {
    const previousMode = this.wheelShouldScroll;

    // Browser convention: ctrl+wheel indicates pinch-to-zoom on trackpads.
    if (e.mouse.event.ctrlKey) {
      this.wheelShouldScroll = true;
    } else if (this.wheelShouldScrollMode === true) {
      this.wheelShouldScroll = true;
    } else if (this.wheelShouldScrollMode === false) {
      this.wheelShouldScroll = false;
    } else {
      // Infer mode from wheel delta mode:
      // - pixel deltas: trackpad / smooth scrolling → pan
      // - line/page deltas: mouse wheel → zoom
      const deltaMode = (e.mouse.event as WheelEvent).deltaMode;
      this.wheelShouldScroll = deltaMode === WheelEvent.DOM_DELTA_PIXEL;
    }

    super.handleWheel(e);
    this.wheelShouldScroll = previousMode;
  }
}

// Backwards/alternate naming convenience
export type IBasicTrackPadCameraControllerOptions =
  IBasicTrackPadCamera2DControllerOptions;
export const BasicTrackPadCameraController = BasicTrackPadCamera2DController;
