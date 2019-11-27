import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCamera2DController,
  BasicSurface,
  Bounds,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  InstanceProvider,
  LabelInstance,
  View2D
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";

import * as Matter from "matter-js";

const { random } = Math;
const PHYSICS_FRAME = 1000 / 60;

export class PhysicsDemo extends BaseDemo {
  /** All circles created for this demo */
  circles: [CircleInstance, Matter.Body][] = [];
  /** Timer used to debounce the shake circle operation */
  shakeTimer: number;

  /** Surface providers */
  providers = {
    circles: new InstanceProvider<CircleInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  /** GUI properties */
  parameters = {
    count: 250,
    radius: 30,

    previous: {
      count: 250
    }
  };

  // Physics engine
  engine: Matter.Engine;
  ground: Matter.Body;
  animationTimer: number;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Controller causes the number of circles rendered to change
    parameters
      .add(this.parameters, "count", 0, 500, 1)
      .onChange(async (value: number) => {
        if (!this.surface) return;
        const bounds = this.surface.getViewScreenBounds("main.view");
        const delta = value - this.parameters.previous.count;

        if (delta > 0) {
          const allObjects: Matter.Body[] = [];

          for (let i = 0; i < delta; ++i) {
            const object = this.makeCircle(bounds);
            allObjects.push(object[1]);
          }

          Matter.World.add(this.engine.world, allObjects);
        }

        if (delta < 0) {
          for (let i = 0; i > delta; --i) {
            this.removeCircle();
          }
        }

        this.parameters.previous.count = value;
      });

    parameters.add(this.parameters, "radius", 2, 50, 1);
  }

  destroy(): void {
    super.destroy();
    this.providers.circles.clear();
    clearInterval(this.animationTimer);
  }

  /**
   * Render pipeline for the demo
   */
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
          camera: cameras.main
        })
      }),
      scenes: (_resources, providers, cameras) => ({
        main: {
          views: {
            view: createView(View2D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: [
            createLayer(CircleLayer, {
              animate: {
                center: AutoEasingMethod.linear(PHYSICS_FRAME)
              },
              data: providers.circles,
              key: `circles`,
              scaleFactor: () => cameras.main.scale2D[0]
            })
          ]
        }
      })
    });
  }

  /**
   * Initialize the demo
   */
  async init() {
    if (!this.surface) return;
    await this.surface.ready;
    const bounds = this.surface.getViewScreenBounds("main.view");

    const engine = (this.engine = Matter.Engine.create());
    const allObjects: Matter.Body[] = [];

    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      const object = this.makeCircle(bounds);
      allObjects.push(object[1]);
    }

    allObjects.push(
      Matter.Bodies.rectangle(
        bounds.width / 2,
        bounds.height + 30,
        bounds.width,
        60,
        {
          isStatic: true
        }
      )
    );
    allObjects.push(
      Matter.Bodies.rectangle(-15, bounds.height / 2, 30, bounds.height, {
        isStatic: true
      })
    );
    allObjects.push(
      Matter.Bodies.rectangle(
        bounds.width + 15,
        bounds.height / 2,
        30,
        bounds.height,
        {
          isStatic: true
        }
      )
    );
    Matter.World.add(engine.world, allObjects);

    const loop = () => {
      Matter.Engine.update(engine, PHYSICS_FRAME);

      for (let i = 0, iMax = this.circles.length; i < iMax; ++i) {
        const circle = this.circles[i];
        const body = circle[1];
        circle[0].center = [body.position.x, body.position.y];
      }
    };

    this.animationTimer = window.setInterval(loop, PHYSICS_FRAME);
  }

  makeCircle(bounds: Bounds<any>): [CircleInstance, Matter.Body] {
    const circle = this.providers.circles.add(
      new CircleInstance({
        center: [random() * bounds.width, random() * bounds.height],
        radius: random() * this.parameters.radius + 1,
        color: [0, random(), random(), 1.0]
      })
    );

    const physics = Matter.Bodies.circle(
      circle.center[0],
      circle.center[1],
      circle.radius
    );

    const object: [CircleInstance, Matter.Body] = [circle, physics];
    this.circles.push(object);

    return object;
  }

  removeCircle() {
    const circle = this.circles.pop();

    if (circle) {
      Matter.World.remove(this.engine.world, circle[1]);
      this.providers.circles.remove(circle[0]);
    }
  }
}
