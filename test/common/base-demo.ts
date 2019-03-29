import * as datGUI from "dat.gui";
import {
  BaseResourceOptions,
  BasicCameraController,
  Bounds,
  ChartCamera,
  EventManager,
  ISceneOptions,
  LayerInitializer
} from "src";
import { Surface } from "../gl/surface";
import { DEFAULT_SCENES, IDefaultResources } from "../types";

/**
 * This is the functionality a Demo should provide that the system will call to
 * control the lufecycle of the demo.
 */
export abstract class BaseDemo {
  /** Holds the surface currently rendering everything */
  surface: Surface;
  /** Contains interval timers created by the demo for easy cleaning */
  private timers: number[] = [];

  /**
   * Hook for when the console for the demo should be set up
   */
  abstract buildConsole(gui: datGUI.GUI): void;

  /**
   * Called when the console and other resources for the demo should be removed.
   */
  destroy() {
    this.timers.forEach(window.clearInterval);
  }

  /**
   * Get the event managers to be provided to the surface
   */
  getEventManagers(
    _defaultController: BasicCameraController,
    _defaultCamera: ChartCamera
  ): EventManager[] | null {
    return null;
  }

  /**
   * Provides the layers the demo will need to operate.
   */
  getLayers(_resources: IDefaultResources): LayerInitializer[] {
    return [];
  }

  /**
   * Provides a means to construct custom resources for the demo.
   */
  getResources(defaultResources: {
    atlas: BaseResourceOptions;
    font: BaseResourceOptions;
  }) {
    return [defaultResources.atlas, defaultResources.font];
  }

  /**
   * Provides an opportunity to reconstruct the scenes of the chart. If this provides scenes
   * the Surface will get destroyed and rebuilt to accommodate the scenes.
   */
  getScenes(_defaultCamera: ChartCamera): ISceneOptions[] | null {
    return DEFAULT_SCENES;
  }

  /**
   * An assurred way to get the screen bounds of a view. If no id is provided it attempts
   * to retrieve the default view's bounds.
   */
  async getViewScreenBounds(viewId?: string): Promise<Bounds | null> {
    const layerSurface = await this.surface.surfaceReady;
    const bounds = layerSurface.getViewSize(viewId || "default-view");

    return bounds;
  }

  /**
   * This is called when everything for the demo should be ready.
   */
  abstract async init(): Promise<void>;

  /**
   * Creates an interval timer that will get cleared on destroy.
   */
  makeInterval(f: Function, time: number) {
    this.timers.push(window.setInterval(f, time));

    return this.timers[this.timers.length - 1];
  }

  /**
   * This triggers when a window resize event occurrs
   */
  resize() {
    // No default operation
  }

  /**
   * Applies the surface being used that renders the elements for the demo.
   */
  setSurface(surface: Surface) {
    this.surface = surface;
  }
}
