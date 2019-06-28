import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  ClearFlags,
  createLayer,
  createView,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  IPickInfo,
  LabelInstance,
  LabelLayer,
  PickType,
  RectangleInstance,
  RectangleLayer,
  Vec4,
  View2D
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { DEFAULT_RESOURCES } from "test/types";

import { SandDance } from "./sand-dance";

export class SandDanceDemo extends BaseDemo {
  // camera: ChartCamera;

  gui: datGUI.GUI;

  parameters = {
    count: 1000,
    moveAtOnce: 100,
    addAtOnce: 30,
    color: [0, 0, 255, 1] as [number, number, number, number],
    width: 6,
    sortBy: "null"
  };

  providers = {
    buckets: new InstanceProvider<RectangleInstance>(),
    rectangles: new InstanceProvider<RectangleInstance>(),
    lines: new InstanceProvider<EdgeInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  sandDance: SandDance;

  selectedRectangle: RectangleInstance | null = null;
  selectedbucket: RectangleInstance | null = null;

  mouseClick = (info: IPickInfo<RectangleInstance>) => {
    if (info.instances.length > 0) {
      const instance = info.instances[0];

      if (!this.selectedRectangle || this.selectedRectangle !== instance) {
        this.selectedRectangle = instance;

        const dimColor: Vec4 = [0.1, 0.1, 0.1, 1.0];
        const highLight: Vec4 = [1, 1, 1, 1];

        this.sandDance.highLightSingleRectangle(dimColor, instance, highLight);
      } else {
        this.selectedRectangle = null;
        this.sandDance.setColorForAllRectangles([0, 0, 1, 1]);
      }
    }
  };

  mouseClickBucket = (info: IPickInfo<RectangleInstance>) => {
    if (info.instances.length > 0) {
      const bucketInstance = info.instances[0];
      if (!this.selectedbucket || this.selectedbucket !== bucketInstance) {
        this.selectedbucket = bucketInstance;
        const rectangles = this.sandDance.bucketToRectangles.get(
          bucketInstance
        );
        if (rectangles) {
          // this.sandDance.setColorForAllRectangles([0.1, 0.1, 0.1, 1]);
          // rectangles.forEach(instance => (instance.color = [1, 1, 1, 1]));
          const dimColor: Vec4 = [0.1, 0.1, 0.1, 1.0];
          const highLight: Vec4 = [1, 1, 1, 1];
          this.sandDance.highLightRectangles(dimColor, rectangles, highLight);
        }
      } else {
        this.selectedbucket = null;
        this.sandDance.setColorForAllRectangles([0, 0, 1, 1]);
      }
    }
  };

  mouseOverBucket = (info: IPickInfo<RectangleInstance>) => {
    if (info.instances.length > 0) {
      const bucketInstance = info.instances[0];
      bucketInstance.color = [0.3, 0.3, 0.3, 1.0];
    }
  };

  mouseOutBucket = (info: IPickInfo<RectangleInstance>) => {
    if (info.instances.length > 0) {
      const bucketInstance = info.instances[0];
      bucketInstance.color = [0.0, 0.0, 0.0, 1.0];
    }
  };

  buildConsole(gui: datGUI.GUI) {
    const parameters = gui.addFolder("Parameters");

    parameters
      .addColor(this.parameters, "color")
      .onChange((value: [number, number, number, number]) => {
        this.sandDance.rectangles.forEach(
          rec =>
            (rec.color = [value[0] / 255, value[1] / 255, value[2] / 255, 1])
        );
      });

    parameters
      .add(this.parameters, "count", 0, 10000, 1)
      .onFinishChange((value: number) => {
        if (value > this.sandDance.persons.length) {
          this.sandDance.addPersons(value - this.sandDance.persons.length);
        } else if (value < this.sandDance.persons.length) {
          this.sandDance.reducePersons(this.sandDance.persons.length - value);
        }
      });

    parameters
      .add(this.parameters, "moveAtOnce", 1, 200)
      .onFinishChange((value: number) => {
        this.sandDance.moveAtOnce = value;
      });

    parameters
      .add(this.parameters, "addAtOnce", 1, 200)
      .onFinishChange((value: number) => {
        this.sandDance.addAtOnce = value;
      });

    this.gui = gui;
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
      rendererOptions: {
        antialias: true
      },
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["default-view"],
          wheelShouldScroll: false
        })
      }),
      pipeline: (resources, providers, cameras) => ({
        scenes: {
          default: {
            views: {
              "default-view": createView(View2D, {
                background: [0, 0, 0, 1],
                camera: cameras.main,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: {
              labels: createLayer(LabelLayer, {
                data: providers.labels,
                resourceKey: resources.font.key
              }),
              rectangles: createLayer(RectangleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(1000),
                  location: AutoEasingMethod.easeInOutCubic(3000)
                },
                data: providers.rectangles,
                onMouseClick: this.mouseClick,
                picking: PickType.SINGLE
              }),
              buckets: createLayer(RectangleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(300)
                },
                data: providers.buckets,
                onMouseClick: this.mouseClickBucket,
                onMouseOver: this.mouseOverBucket,
                onMouseOut: this.mouseOutBucket,
                picking: PickType.SINGLE
              }),
              lines: createLayer(EdgeLayer, {
                data: providers.lines,
                type: EdgeType.LINE
              })
            }
          }
        }
      })
    });
  }

  async init() {
    this.sandDance = new SandDance({
      addAtOnce: this.parameters.addAtOnce,
      moveAtOnce: this.parameters.moveAtOnce,
      rectangleCount: this.parameters.count,
      providers: this.providers
    });

    this.gui
      .add(this.parameters, "sortBy", this.sandDance.keys)
      .setValue(this.sandDance.keys[0])
      .onChange((key: string) => {
        this.sandDance.sortByKey(key);
      });
  }
}
