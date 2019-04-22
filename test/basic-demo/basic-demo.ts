import * as datGUI from "dat.gui";
import {
  add2,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  BasicCameraController,
  ChartCamera,
  CircleInstance,
  CircleLayer,
  createLayer,
  IMouseInteraction,
  InstanceProvider,
  ISceneOptions,
  LayerInitializer,
  length2,
  scale2,
  Vec2
} from "src";
import { BaseDemo } from "../common/base-demo";
import { EventHandler } from "../common/event-handler";

const { random } = Math;

/**
 * A very basic demo proving the system is operating as expected
 */
export class BasicDemo extends BaseDemo {
  /** The camera in use */
  camera: ChartCamera;
  /** All circles created for this demo */
  circles: CircleInstance[] = [];
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

    previous: {
      count: 1000
    }
  };

  currentLocation: Vec2 = [0, 0];

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Controller causes the number of circles rendered to change
    parameters
      .add(this.parameters, "count", 0, 100000, 1)
      .onChange(async (value: number) => {
        const delta = value - this.parameters.previous.count;

        if (delta > 0) {
          for (let i = 0; i < delta; ++i) {
            this.makeCircle();
          }
        }

        if (delta < 0) {
          for (let i = 0; i > delta; --i) {
            this.removeCircle();
          }
        }

        this.parameters.previous.count = value;

        this.shakeCircles();
      });

    parameters
      .add(this.parameters, "radius", 0, 2000, 1)
      .onChange(async (_value: number) => {
        this.moveToLocation(this.currentLocation);
      });
  }

  destroy(): void {
    this.providers.circles.clear();
  }

  getEventManagers(
    defaultController: BasicCameraController,
    _defaultCamera: ChartCamera
  ) {
    return [
      defaultController,
      new EventHandler({
        handleMouseUp: (e: IMouseInteraction, _button: number) => {
          const target = e.target;
          this.moveToLocation(target.view.screenToWorld(e.screen.mouse));
        }
      })
    ];
  }

  getScenes(defaultCamera: ChartCamera): ISceneOptions[] | null {
    this.camera = defaultCamera;
    return super.getScenes(defaultCamera);
  }

  getLayers(): LayerInitializer[] {
    return [
      createLayer(CircleLayer, {
        animate: {
          center: AutoEasingMethod.easeInOutQuad(
            1000,
            100,
            AutoEasingLoopStyle.NONE
          )
        },
        data: this.providers.circles,
        key: `circles`,
        scaleFactor: () => this.camera.scale[0],
        scene: "default"
      })
    ];
  }

  async init() {
    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeCircle();
    }

    this.shakeCircles();
  }

  makeCircle() {
    const circle = this.providers.circles.add(
      new CircleInstance({
        center: [random() * 2000, random() * 2000],
        radius: random() * 10 + 2,
        color: [0, random(), random(), 1.0]
      })
    );

    this.circles.push(circle);
  }

  moveToLocation(location: Vec2) {
    const easingId = CircleLayer.attributeNames.center;

    this.circles.forEach(circle => {
      let direction: Vec2 = [random() - 0.5, random() - 0.5];
      const mag = length2(direction);
      direction = scale2(direction, 1 / mag);
      circle.center = add2(
        location,
        scale2(direction, random() * this.parameters.radius)
      );

      // Give the system more time to buffer the changes in when there are a lot of dots
      if (this.circles.length > 50000) {
        const easing = circle.getEasing(easingId);

        if (easing) {
          easing.setTiming(500);
        }
      } else if (this.circles.length <= 50000) {
        const easing = circle.getEasing(easingId);

        if (easing) {
          easing.setTiming(100);
        }
      }
    });

    this.currentLocation = location;
  }

  removeCircle() {
    const circle = this.circles.pop();
    if (circle) this.providers.circles.remove(circle);
  }

  shakeCircles() {
    clearTimeout(this.shakeTimer);

    this.shakeTimer = window.setTimeout(() => {
      this.circles.forEach(circle => {
        circle.center = [
          circle.center[0] + random() * 10 - 5,
          circle.center[1] + random() * 10 - 5
        ];
      });
    }, 100);
  }
}