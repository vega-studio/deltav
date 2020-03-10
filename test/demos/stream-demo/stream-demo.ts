import * as datGUI from "dat.gui";
import {
  add2,
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
  EasingUtil,
  IMouseInteraction,
  InstanceProvider,
  ITouchInteraction,
  Layer,
  length2,
  scale2,
  Vec2,
  Vec2Compat,
  View2D
} from "../../../src";
import { SimpleEventHandler } from "../../../src/event-management/simple-event-handler";
import { BaseDemo } from "../../common/base-demo";

const { random } = Math;

/**
 * A very basic demo proving the system is operating as expected
 */
export class StreamDemo extends BaseDemo {
  /** Get a layer reference for deeper inspection of the layer */
  circleLayer = Layer.createRef();
  /** All circles created for this demo */
  circles: CircleInstance[] = [];
  /** Stores the size of the screen */
  screen: Bounds<any>;
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

  currentLocation: Vec2Compat = [0, 0];

  /**
   * Builds our dat.gui console to manage properties
   */
  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    parameters
      .add(this.parameters, "count", 0, 100000, 1)
      .onFinishChange(async () => {
        this.update();
      });

    parameters
      .add(this.parameters, "radius", 0, 10000, 1)
      .onChange(async (_value: number) => {
        this.moveToLocation(this.currentLocation);
      });
  }

  /**
   * Syncs up our spawned circles to the count specified in the gui parameters
   */
  async update() {
    // Get the size of area to add new circles
    if (!this.surface || !this.circleLayer.easing) return;
    this.screen = this.surface.getViewWorldBounds("main.main");

    // Add in circles to match our parameter count
    if (this.circles.length < this.parameters.count) {
      const added = [];

      for (let i = 0; this.circles.length < this.parameters.count; ++i) {
        added.push(this.makeCircle());
      }

      // Wait for all adds to complete
      await this.circleLayer.easing.complete();

      // Set the size of the circles so they bubble in
      added.forEach(circle => {
        circle.radius = Math.random() * 10 + 2;
      });

      // Offset the start delay times to create a more natural effect for changes
      EasingUtil.modify(
        added,
        [CircleLayer.attributeNames.radius, CircleLayer.attributeNames.center],
        easing => {
          easing.setTiming(Math.random() * 2000);
        }
      );
    }

    if (this.circles.length > this.parameters.count) {
      for (let i = 0; this.circles.length > this.parameters.count; ++i) {
        this.removeCircle();
      }
    }
  }

  /**
   * Make our surface for our render pipeline
   */
  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.main"]
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
              ref: this.circleLayer,
              animate: {
                center: AutoEasingMethod.easeInOutCubic(2000),
                radius: AutoEasingMethod.easeBackInOut(1000)
              },
              streamChanges: {
                count: 2000
              },
              data: providers.circles,
              scaleFactor: () => cameras.main.scale2D[0],
              usePoints: true
            })
          }
        }
      })
    });
  }

  /**
   * Initialize the demo
   */
  async init() {
    // Wait for the surface to be prepped
    if (!this.surface) return;
    await this.surface.ready;
    // Initialize our instances to match our datgui configuration
    this.update();
  }

  /**
   * Makes a new circle added to the rendering
   */
  makeCircle() {
    const circle = this.providers.circles.add(
      new CircleInstance({
        center: [
          random() * this.screen.width + this.screen.x,
          random() * this.screen.height + this.screen.y
        ],
        radius: 0,
        color: [0, random(), random(), 1.0]
      })
    );

    this.circles.push(circle);

    return circle;
  }

  /**
   * Moves all circles to the target location within the given radius
   */
  async moveToLocation(location: Vec2Compat) {
    this.currentLocation = location;

    // Simply update all circles no questions asked!
    this.circles.forEach(circle => {
      let direction: Vec2 = [random() - 0.5, random() - 0.5];
      const mag = length2(direction);
      direction = scale2(direction, 1 / mag);
      circle.center = add2(
        location,
        scale2(direction, random() * this.parameters.radius)
      );
    });

    // Await for the completion of all easing
    await this.circleLayer.easing?.complete();

    this.currentLocation = location;
  }

  removeCircle() {
    const circle = this.circles.pop();
    if (circle) this.providers.circles.remove(circle);
  }
}
