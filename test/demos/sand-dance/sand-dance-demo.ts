import * as datGUI from "dat.gui";
import {
  AutoEasingMethod,
  BasicCameraController,
  BasicSurface,
  ChartCamera,
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
  RectangleLayer
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { DEFAULT_RESOURCES } from "test/types";

import { SandDance } from "./sand-dance";

export class SandDanceDemo extends BaseDemo {
  camera: ChartCamera;

  gui: datGUI.GUI;

  parameters = {
    count: 1000,
    color: [0, 0, 255, 1] as [number, number, number, number],
    width: 6,
    sortBy: "null"
  };
  providers = {
    bins: new InstanceProvider<RectangleInstance>(),
    rectangles: new InstanceProvider<RectangleInstance>(),
    lines: new InstanceProvider<EdgeInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  sandDance: SandDance;

  selectedRectangle: RectangleInstance | null = null;
  selectedBin: RectangleInstance | null = null;

  mouseClick = (info: IPickInfo<RectangleInstance>) => {
    if (info.instances.length > 0) {
      const instance = info.instances[0];
      if (!this.selectedRectangle || this.selectedRectangle !== instance) {
        this.selectedRectangle = instance;
        this.sandDance.setColorForAllRectangles([0.1, 0.1, 0.1, 1]);
        instance.color = [1, 1, 1, 1];
      } else {
        this.selectedRectangle = null;
        this.sandDance.setColorForAllRectangles([0, 0, 1, 1]);
      }
    }
  };

  mouseClickBin = (info: IPickInfo<RectangleInstance>) => {
    if (info.instances.length > 0) {
      const binInstance = info.instances[0];
      if (!this.selectedBin || this.selectedBin !== binInstance) {
        this.selectedBin = binInstance;
        const rectangles = this.sandDance.binToRectangles.get(binInstance);
        if (rectangles) {
          this.sandDance.setColorForAllRectangles([0.1, 0.1, 0.1, 1]);
          rectangles.forEach(instance => (instance.color = [1, 1, 1, 1]));
        }
      } else {
        this.selectedBin = null;
        this.sandDance.setColorForAllRectangles([0, 0, 1, 1]);
      }
    }
  };

  buildConsole(gui: datGUI.GUI) {
    const parameters = gui.addFolder("Parameters");

    parameters
      .addColor(this.parameters, "color")
      .onChange((_value: [number, number, number, number]) => {
        //
      });

    parameters
      .add(this.parameters, "count", 0, 10000, 1)
      .onFinishChange((value: number) => {
        if (value > this.sandDance.persons.length) {
          console.warn("add");
          this.sandDance.addPersons(value - this.sandDance.persons.length);
        } else if (value < this.sandDance.persons.length) {
          this.sandDance.reducePersons(this.sandDance.persons.length - value);
        }
      });

    this.gui = gui;
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      cameras: {
        main: new ChartCamera()
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      rendererOptions: {
        antialias: true
      },
      eventManagers: cameras => ({
        main: new BasicCameraController({
          camera: cameras.main,
          startView: ["default-view"],
          wheelShouldScroll: false
        })
      }),
      pipeline: (resources, providers, cameras) => ({
        scenes: {
          default: {
            views: {
              "default-view": createView({
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
              lines: createLayer(EdgeLayer, {
                data: providers.lines,
                type: EdgeType.LINE
              }),
              rectangles: createLayer(RectangleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(300),
                  location: AutoEasingMethod.easeInOutCubic(3000)
                },
                data: providers.rectangles,
                onMouseClick: this.mouseClick,
                picking: PickType.SINGLE
              }),
              bins: createLayer(RectangleLayer, {
                animate: {
                  color: AutoEasingMethod.linear(300)
                },
                data: providers.bins,
                onMouseClick: this.mouseClickBin,
                picking: PickType.SINGLE
              })
            }
          }
        }
      })
    });
  }

  async init() {
    this.sandDance = new SandDance({ providers: this.providers });

    this.gui
      .add(this.parameters, "sortBy", this.sandDance.keys)
      .setValue(this.sandDance.keys[0])
      .onChange((key: string) => {
        this.sandDance.sortByKey(key);
      });
  }
}
