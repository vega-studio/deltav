import * as datGUI from "dat.gui";
import {
  BaseResourceOptions,
  BasicSurface,
  Camera2D,
  EventManager,
  IBasicSurfaceOptions,
  Instance,
  InstanceProvider,
  Lookup,
  Omit
} from "src";

export type DemoPipeline<
  T extends Lookup<InstanceProvider<Instance>>,
  U extends Lookup<Camera2D>,
  V extends Lookup<EventManager>,
  W extends Lookup<BaseResourceOptions>
> = Omit<
  IBasicSurfaceOptions<T, U, V, W>,
  "container" | "onNoWebGL" | "handlesWheelEvents" | "rendererOptions"
>;

export interface ITest<T> {
  method(): T;
}

/**
 * This is the functionality a Demo should provide that the system will call to
 * control the lufecycle of the demo.
 */
export abstract class BaseDemo {
  /** Contains interval timers created by the demo for easy cleaning */
  private timers: number[] = [];
  /** This helps ensure the demo called it's super.destroy during it's destroy routine */
  private _isDestroyed = false;
  get isDestroyed() {
    return this._isDestroyed;
  }
  /** The surface being used to render this demo */
  surface?: ReturnType<this["makeSurface"]>;

  /**
   * Hook for when the console for the demo should be set up
   */
  abstract buildConsole(gui: datGUI.GUI): void;

  /**
   * Called when the console and other resources for the demo should be removed.
   */
  destroy() {
    this.timers.forEach(window.clearInterval);
    if (this.surface) this.surface.destroy();
    this._isDestroyed = true;
  }

  /**
   * Lets the demo produce a surface that will render it's application
   */
  abstract makeSurface(
    container: HTMLElement
  ): BasicSurface<any, any, any, any>;

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
   * When called, causes the current demo to be reloaded from the ground up. Allows the demo to toggle
   * properties that needs a layer reconstruction since layers are unable to perform that
   */
  refreshDemo() {
    // TODO
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
  setSurface(surface: ReturnType<this["makeSurface"]>) {
    this.surface = surface;
  }
}
