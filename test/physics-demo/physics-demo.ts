import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCameraController,
  Bounds,
  ChartCamera,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  IMouseInteraction,
  InstanceProvider,
  IPipeline
} from "src";
import { BaseDemo } from "../common/base-demo";
import { EventHandler } from "../common/event-handler";

import * as Matter from "matter-js";

const { random } = Math;
const PHYSICS_FRAME = 1000 / 60;

export class PhysicsDemo extends BaseDemo {
  /** The camera in use */
  camera: ChartCamera;
  /** All circles created for this demo */
  circles: [CircleInstance, Matter.Body][] = [];
  /** Timer used to debounce the shake circle operation */
  shakeTimer: number;

  /** Surface providers */
  providers = {
    circles: new InstanceProvider<CircleInstance>()
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
        const bounds = await this.getViewScreenBounds();
        if (!bounds) return;
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
    this.providers.circles.clear();
    clearInterval(this.animationTimer);
  }

  getEventManagers(
    defaultController: BasicCameraController,
    defaultCamera: ChartCamera
  ) {
    this.camera = defaultCamera;
    return [
      defaultController,
      new EventHandler({
        handleMouseUp: (_e: IMouseInteraction, _button: number) => {
          // const target = e.target;
          // this.moveToLocation(target.view.screenToWorld(e.screen.mouse));
        }
      })
    ];
  }

  /**
   * Render pipeline for the demo
   */
  pipeline(): IPipeline {
    return {
      scenes: [
        {
          key: "default",
          views: [
            createView({
              key: "default-view",
              camera: this.camera,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          ],
          layers: [
            createLayer(CircleLayer, {
              animate: {
                center: AutoEasingMethod.linear(PHYSICS_FRAME)
              },
              data: this.providers.circles,
              key: `circles`,
              scaleFactor: () => this.camera.scale[0]
            })
          ]
        }
      ]
    };
  }

  /**
   * Initialize the demo
   */
  async init() {
    const bounds = await this.getViewScreenBounds();
    if (!bounds) return;

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
