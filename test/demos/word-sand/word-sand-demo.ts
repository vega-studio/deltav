import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCameraController,
  BasicSurface,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  InstanceProvider
} from "src";
import { Camera, CameraProjectionType } from "src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { debounce } from "../../common/debounce";
import { textPositions } from "../../common/text-positions";

const { random } = Math;

/**
 * A demo demonstrating particles collecting within the bounds of text.
 */
export class WordSandDemo extends BaseDemo {
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
    count: 10000,
    speedFactor: 1,
    text: "Enter Text",
    fontSize: 60,

    previous: {
      count: 10000
    }
  };

  /**
   * Dat gui construction
   */
  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");

    // Changes the shape the circles take on
    parameters.add(this.parameters, "text").onChange(
      debounce(async (_value: number) => {
        this.moveToText(this.circles);
      }, 250)
    );

    // Controller causes the number of circles rendered to change
    parameters.add(this.parameters, "count", 5000, 50000, 1).onChange(
      debounce(async (value: number) => {
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

        this.moveToText(this.circles);
      }, 250)
    );

    parameters.add(this.parameters, "speedFactor", 0.01, 2, 0.01);

    parameters
      .add(this.parameters, "fontSize", 4, 80, 1)
      .onChange(async (_value: number) => {
        this.moveToText(this.circles);
      });
  }

  /**
   * The pipeline used to render our providers
   */
  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      cameras: {
        main: new Camera({
          type: CameraProjectionType.ORTHOGRAPHIC,
          left: -100,
          right: 100,
          bottom: -100,
          top: 100,
          near: -100,
          far: 100
        })
      },
      providers: this.providers,
      resources: {},
      eventManagers: cameras => ({
        main: new BasicCameraController({
          camera: cameras.main,
          startView: ["default-view"]
        })
      }),
      pipeline: (_resources, providers, cameras) => ({
        scenes: [
          {
            key: "default",
            views: [
              createView({
                key: "default-view",
                camera: cameras.main,
                clearFlags: [ClearFlags.DEPTH, ClearFlags.COLOR]
              })
            ],
            layers: [
              createLayer(CircleLayer, {
                animate: {
                  center: AutoEasingMethod.easeInOutQuad(250)
                },
                data: providers.circles,
                key: "circles",
                scaleFactor: () => cameras.main.scale[0]
              })
            ]
          }
        ]
      })
    });
  }

  /**
   * Initialize the demo with beginning setup and layouts
   */
  async init() {
    this.providers.circles.clear();
    this.circles = [];

    for (let i = 0, iMax = this.parameters.count; i < iMax; ++i) {
      this.makeCircle();
    }

    this.moveToText(this.circles);
  }

  /**
   * Makes a circle and stores it in our circles array and adds it to the rendering
   */
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

  /**
   * Moves all specified circles to the text specified
   */
  private async moveToText(circles: CircleInstance[]) {
    const bounds = await this.getViewScreenBounds();
    if (!bounds) return;

    const xy = textPositions(
      bounds,
      this.parameters.text,
      this.parameters.fontSize
    );

    xy.sort((a, b) => a[0] - b[0]);
    const circleBuckets: CircleInstance[][] = [];
    const bucketLength = xy.length;
    const toProcess = circles.slice(0);
    let i = 0;

    while (toProcess.length > 0) {
      const circle = toProcess.splice(
        Math.floor(Math.random() * toProcess.length),
        1
      )[0];
      const index = i++ % bucketLength;
      const bucket = (circleBuckets[index] = circleBuckets[index] || []);
      bucket.push(circle);
    }

    for (let i = 0, end = circleBuckets.length; i < end; ++i) {
      const bucket = circleBuckets[i];
      const pos = xy[i];

      for (let k = 0, end = bucket.length; k < end; ++k) {
        const circle = bucket[k];

        if (circle && pos) {
          circle.center = [pos[0], pos[1]];
          circle.radius = 0.5;
          circle.color = [random(), random(), 1.0, 1.0];

          const easing = circle.getEasing(CircleLayer.attributeNames.center);
          if (easing) {
            easing.setTiming(10 + i * this.parameters.speedFactor);
          }
        }
      }
    }
  }

  /**
   * Remove a circle from the rendering
   */
  removeCircle() {
    const circle = this.circles.pop();
    if (circle) this.providers.circles.remove(circle);
  }

  /**
   * Respond to window resizes
   */
  resize() {
    this.moveToText(this.circles);
  }
}
