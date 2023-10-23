import * as datGUI from "dat.gui";
import {
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  ClearFlags,
  createLayer,
  createView,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  nextFrame,
  onAnimationLoop,
  onFrame,
  ScaleMode,
  Size,
  Vec2Compat,
  View2D
} from "../../../../src";
import { BaseDemo } from "../../common/base-demo";
import { DEFAULT_RESOURCES } from "../../types";

/**
 * A very basic demo proving the system is operating as expected
 */
export class FrameCommandDemo extends BaseDemo {
  /** The text area containing our metrics output */
  text: LabelInstance[] = [];
  /** Stores the size of the screen */
  screen!: Size;
  /** Timer used to debounce the shake circle operation */
  shakeTimer!: number;

  /** Surface providers */
  providers = {
    labels: new InstanceProvider<LabelInstance>()
  };

  /** GUI properties */
  parameters = {
    start: async () => {
      await this.updateTimeTest();
    }
  };

  currentLocation: Vec2Compat = [0, 0];

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Action button for starting the demo
    parameters.add(this.parameters, "start");
  }

  destroy(): void {
    super.destroy();
    this.providers.labels.clear();
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.main"]
        })
      }),
      scenes: (resources, providers, cameras) => ({
        main: {
          views: {
            main: createView(View2D, {
              camera: cameras.main,
              background: [0, 0, 0, 1],
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            }) as any
          },
          layers: {
            labels: createLayer(LabelLayer, {
              data: providers.labels,
              resourceKey: resources.font.key
            })
          }
        }
      })
    });
  }

  makeLabel(index: number, y: number, text: string) {
    if (this.text[index] === void 0) {
      const label = new LabelInstance({
        color: [1, 1, 1, 1],
        origin: [20, y],
        fontSize: 20,
        scale: ScaleMode.BOUND_MAX,
        text
      });

      this.text[index] = label;
    } else {
      this.text[index].origin = [20, y];
      this.text[index].text = text;
    }

    return this.text[index];
  }

  async updateTimeTest() {
    let y = 0;
    const space = 20;
    let i = -1;

    // On frame test
    const onFrameTime = await onFrame();
    this.makeLabel(++i, ++y * space, `await onFrame(): ${onFrameTime}`);

    // On frame with interval
    const onFrameIntervalTime = await onFrame(undefined, 1000);
    this.makeLabel(
      ++i,
      ++y * space,
      `await onFrame(command, interval): ${onFrameIntervalTime}`
    );

    // Next Frame test
    const nextFrameTime = await nextFrame();
    this.makeLabel(++i, ++y * space, `await nextFrame(): ${nextFrameTime}`);

    // Animation loop test
    let loopCalls1 = 0;
    const animationStart = await onAnimationLoop(() => ++loopCalls1);
    const totalAnimationLoopCalls = loopCalls1;
    this.makeLabel(
      ++i,
      ++y * space,
      `await onAnimationLoop(command): ${animationStart} Calls: ${totalAnimationLoopCalls}`
    );

    // Animation loop with duration test
    let loopCalls2 = 0;
    const duration = await onAnimationLoop(() => ++loopCalls2, undefined, 1000);
    const totalAnimationDurationCalls = loopCalls2;
    this.makeLabel(
      ++i,
      ++y * space,
      `await onAnimationLoop(command, undefined, duration): ${duration} Calls: ${totalAnimationDurationCalls}`
    );

    // Animation loop with interval test
    let loopCalls3 = 0;
    const intervalWithDuration = await onAnimationLoop(
      () => ++loopCalls3,
      100,
      1000
    );
    const totalIntervalDurationCalls = loopCalls3;
    this.makeLabel(
      ++i,
      ++y * space,
      `await onAnimationLoop(command, interval, duration): ${intervalWithDuration} Calls: ${totalIntervalDurationCalls}`
    );
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;
    this.screen = this.surface.getViewScreenSize("main.main");
    await this.updateTimeTest();
    this.text.forEach(txt => this.providers.labels.add(txt));
  }
}
