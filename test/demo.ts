import * as datGUI from "dat.gui";
import { BasicCameraController, ChartCamera } from "src";
import { DEFAULT_RESOURCES } from "test/types";
import { BaseDemo } from "./common/base-demo";
import { demoKeys, demos, startDemoKey } from "./config";
import { Surface } from "./gl/surface";

export interface IDemoOptions {
  container: HTMLElement;
}

/**
 * This class bootstraps the demos and provides the controls and means for switching between
 * demos and setting up the basic surfaces.
 */
export class Demo {
  /** The current demo being rendered */
  currentDemo: BaseDemo;
  /** The GUI console for controlling demos */
  gui: datGUI.GUI;
  /** The options that started up the demo */
  options: IDemoOptions;
  /** The GL surface that manages our graphics pipeline */
  surface: Surface;

  /** A storage object for the GUI to operate with */
  guiStore = {
    currentDemo: startDemoKey
  };

  /** Debounce the resizing events */
  private resizeTimer: number;

  constructor(options: IDemoOptions) {
    this.options = options;
    window.addEventListener("resize", this.resize);
  }

  /**
   * Builds a new console and destroys the old console
   */
  buildConsole() {
    // Destroy prexisting GUI
    if (this.gui) {
      this.gui.destroy();
    }

    // Build a new GUI
    const gui = new datGUI.GUI({
      autoPlace: true,
      closed: true,
      hideable: true,
      name: "Demo Control"
    });

    // Add the gui to the folder
    gui
      .addFolder("Demo Selection")
      .add(this.guiStore, "currentDemo", demoKeys)
      .onChange(async (value: string) => {
        await this.changeDemo(value);
      });

    // Indicate we have a new console dictating the system
    this.gui = gui;
  }

  /**
   * This causes the system to switch to a new demo. It will clean up resources and manage demo lifecycles
   * to properly shift to the specified demo.
   */
  async changeDemo(demoKey: string) {
    // If a demo is already established, make sure it frees up any resources it may be hanging onto
    if (this.currentDemo) {
      this.currentDemo.destroy();
    }

    // See if there is a demo available
    const demo = demos.get(demoKey);
    if (!demo) {
      console.warn("Error: Could not find a demo for key", demoKey);
      return;
    }

    // Our current demo is officially the new demo found
    this.currentDemo = demo;

    // Initialize the surface and pass the demo's specifications to it
    await this.surface.init({
      makeElements: (
        defaultController: BasicCameraController,
        defaultCamera: ChartCamera
      ) => {
        if (!demo) return {};

        return {
          resources: demo.getResources(DEFAULT_RESOURCES),
          eventManagers: demo.getEventManagers(
            defaultController,
            defaultCamera
          ),
          layers: () => demo.getLayers(DEFAULT_RESOURCES),
          scenes: demo.getScenes(defaultCamera)
        };
      }
    });

    // Set the created surface to the demo
    demo.setSurface(this.surface);
    // Build a new console for the demo
    this.buildConsole();
    // Let the demo modify the console
    demo.buildConsole(this.gui);

    // Let the demo know everything is done and ready for the demo to operate
    await demo.init();

    localStorage.setItem("deltaV_currentDemo", demoKey);
  }

  /**
   * Frees all resources this demo holds
   */
  destroy() {
    this.surface.destroySurface();
    if (this.currentDemo) this.currentDemo.destroy();
    window.removeEventListener("resize", this.resize);
  }

  /**
   * Sets up initial Resources and demos
   */
  async init() {
    // First determine which demo we'll be showing
    let demoKey = startDemoKey;

    if (!demoKey) {
      demoKey = demos.keys().next().value;
      if (!demoKey) return;
      this.guiStore.currentDemo = demoKey;
    }

    if (!demoKey) {
      console.warn("Error: The first demo was not able to be determined.");
      return;
    }

    // After the demo has been determined, let's create our first surface to handle the demo's
    // request of scenes and layers.
    this.surface = new Surface({
      background: [0, 0, 0, 1],
      container: this.options.container
    });

    // Make the system boot up the specified demo
    this.changeDemo(demoKey);
  }

  /**
   * Responds to window resizing events
   */
  resize = () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => {
      if (this.currentDemo) {
        this.surface.resize();
        this.currentDemo.resize();
      }
    }, 100);
  };
}