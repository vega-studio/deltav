import * as datGUI from "dat.gui";
import { stopAllFrameCommands } from "../../src";
import { BaseDemo } from "./common/base-demo";
import { demoKeys, demos, startDemoKey } from "./config";

export interface IDemoOptions {
  container: HTMLElement;
}

/**
 * This class bootstraps the demos and provides the controls and means for switching between
 * demos and setting up the basic surfaces.
 */
export class Demo {
  /** The current demo being rendered */
  currentDemo?: BaseDemo;
  /** The GUI console for controlling demos */
  gui?: datGUI.GUI;
  /** The options that started up the demo */
  options: IDemoOptions;

  /** A storage object for the GUI to operate with */
  guiStore = {
    currentDemo: startDemoKey
  };

  constructor(options: IDemoOptions) {
    this.options = options;
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
    // Ensure ANY queued frame commands are cleared out
    stopAllFrameCommands();

    // If a demo is already established, make sure it frees up any resources it may be hanging onto
    if (this.currentDemo) {
      this.currentDemo.destroy();

      if (!this.currentDemo.isDestroyed) {
        console.error(
          "A demo did NOT call super.destroy() in it's destroy method!"
        );
      }
    }

    // See if there is a demo available
    const demo = demos.get(demoKey);
    if (!demo) {
      console.warn("Error: Could not find a demo for key", demoKey);
      return;
    }

    // Our current demo is officially the new demo found
    this.currentDemo = new demo();

    // Make the demo produce it's surface.
    const surface = this.currentDemo.makeSurface(this.options.container);
    // Set the created surface to the demo
    this.currentDemo.setSurface(surface);
    // Wait for the surface to be prepped
    await surface.ready;
    // Build a new console for the demo
    this.buildConsole();
    // Let the demo modify the console
    this.currentDemo.buildConsole(this.gui!);
    // Let the demo know everything is done and ready for the demo to operate
    await this.currentDemo.init();
    // Set this demo as the current demo so page refreshes return here
    localStorage.setItem("deltaV_currentDemo", demoKey);
  }

  /**
   * Frees all resources this demo holds
   */
  destroy() {
    if (this.currentDemo) this.currentDemo.destroy();
  }

  /**
   * Sets up initial Resources and demos
   */
  async init() {
    // First determine which demo we'll be showing
    let demoKey = startDemoKey;

    if (!demos.get(demoKey)) {
      demoKey = demos.keys().next().value;
      if (!demoKey) return;
      this.guiStore.currentDemo = demoKey;
    }

    if (!demoKey) {
      console.warn("Error: The first demo was not able to be determined.");
      return;
    }

    // Make the system boot up the specified demo
    this.changeDemo(demoKey);
  }
}
