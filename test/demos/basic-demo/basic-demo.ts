import * as datGUI from "dat.gui";
import {
  add2,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  commands,
  createLayer,
  createView,
  EasingUtil,
  IMouseInteraction,
  InstanceProvider,
  ITouchInteraction,
  length2,
  nextFrame,
  onFrame,
  scale2,
  SimpleEventHandler,
  Size,
  Vec2,
  Vec2Compat,
  Vec4,
  View2D
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";

const { random } = Math;

/**
 * A very basic demo proving the system is operating as expected
 */
export class BasicDemo extends BaseDemo {
  /** All circles created for this demo */
  circles: CircleInstance[] = [];
  /** Stores the size of the screen */
  screen: Size;
  /** Timer used to debounce the shake circle operation */
  shakeTimer: number;

  /** Surface providers */
  providers = {
    circles: new InstanceProvider<CircleInstance>()
  };

  /** GUI properties */
  parameters = {
    count: 1000,
    radius: 100,
    moveAtOnce: 10000,
    addAtOnce: 10000,

    previous: {
      count: 1000
    }
  };

  currentLocation: Vec2Compat = [0, 0];

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Controller causes the number of circles rendered to change
    parameters
      .add(this.parameters, "count", 0, 500000, 1)
      .onFinishChange(async () => {
        while (this.circles.length < this.parameters.count) {
          for (
            let i = 0;
            i < this.parameters.addAtOnce &&
            this.circles.length < this.parameters.count;
            ++i
          ) {
            this.makeCircle();
          }
          await nextFrame();
        }

        while (this.circles.length > this.parameters.count) {
          for (
            let i = 0;
            i < this.parameters.addAtOnce &&
            this.circles.length > this.parameters.count;
            ++i
          ) {
            this.removeCircle();
          }
          await nextFrame();
        }
      });

    parameters.add(this.parameters, "addAtOnce", 0, 100000, 1);
    parameters.add(this.parameters, "moveAtOnce", 0, 100000, 1);

    parameters
      .add(this.parameters, "radius", 0, 10000, 1)
      .onChange(async (_value: number) => {
        this.moveToLocation(this.currentLocation);
      });
  }

  destroy(): void {
    super.destroy();
    this.providers.circles.clear();
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {},
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.main"],
          ignoreCoverViews: true
        }),
        clickScreen: new SimpleEventHandler({
          handleClick: (e: IMouseInteraction) => {
            const target = e.target;
            this.moveToLocation(
              target.view.projection.screenToWorld(e.screen.position)
            );
          },
          handleTap: (e: ITouchInteraction) => {
            const touch = e.touches[0];
            this.moveToLocation(
              touch.target.view.projection.screenToWorld(touch.screen.position)
            );
          }
        })
      }),
      scenes: (_resources, providers, cameras) => ({
        preRender: commands(surface => {
          surface.commands.decodePicking();
        }),
        main: {
          views: {
            main: createView(View2D, {
              camera: cameras.main,
              background: [0, 0, 0, 1],
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: {
            circles: createLayer(CircleLayer, {
              animate: {
                center: AutoEasingMethod.easeInOutCubic(
                  2000,
                  0,
                  AutoEasingLoopStyle.NONE
                )
              },

              data: providers.circles,
              usePoints: true
            })
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    this.screen = this.surface.getViewScreenSize(
      scenes => scenes.main.views.main
    );

    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeCircle();
    }
  }

  makeColor(): Vec4 {
    return [0, random(), random(), 1.0];
  }

  makeCircle() {
    const circle = this.providers.circles.add(
      new CircleInstance({
        center: [random() * this.screen[0], random() * this.screen[1]],
        radius: random() * 10 + 2,
        color: this.makeColor()
      })
    );

    this.circles.push(circle);
  }

  async moveToLocation(location: Vec2Compat) {
    this.currentLocation = location;

    let index = 0;
    while (index < this.circles.length) {
      const moved = [];
      for (
        let i = 0;
        i < this.parameters.moveAtOnce && index < this.circles.length;
        ++i, ++index
      ) {
        const circle = this.circles[index];
        let direction: Vec2 = [random() - 0.5, random() - 0.5];
        const mag = length2(direction);
        direction = scale2(direction, 1 / mag);
        circle.center = add2(
          location,
          scale2(direction, random() * this.parameters.radius)
        );
        moved.push(circle);
      }

      // Randomize their start times to make the stream more fluid
      EasingUtil.all(
        false,
        moved,
        [CircleLayer.attributeNames.center],
        easing => {
          easing.setTiming(Math.random() * 2000);
        }
      );

      await onFrame();
    }

    await EasingUtil.all(true, this.circles, [
      CircleLayer.attributeNames.center
    ]);

    this.currentLocation = location;
  }

  removeCircle() {
    const circle = this.circles.pop();
    if (circle) this.providers.circles.remove(circle);
  }
}
