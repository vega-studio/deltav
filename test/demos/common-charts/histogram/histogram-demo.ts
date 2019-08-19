import * as datGUI from "dat.gui";
import {
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
  RectangleInstance,
  RectangleLayer,
  View2D
} from "src";
import { BaseDemo } from "../../../common/base-demo";
import { Histogram } from "./histogram";

export class HistogramDemo extends BaseDemo {
  chart: Histogram;
  providers = {
    rectangles: new InstanceProvider<RectangleInstance>(),
    lines: new InstanceProvider<EdgeInstance>()
  };

  buildConsole(_gui: datGUI.GUI) {
    //
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    this.chart = new Histogram({
      origin: [window.innerWidth * 0.1, window.innerHeight * 0.9],
      barNames: ["a", "b", "c", "d"],
      datas: [50, 60, 70, 90],
      colors: ["blue", "red", 0x00ff00, [1, 1, 0, 1]],
      height: window.innerHeight * 0.8,
      width: window.innerWidth * 0.8
    });

    this.addChartToProvider();
  }

  addChartToProvider() {
    // if (!this.chart) return;
    this.chart.rectangles.forEach(rectangle =>
      this.providers.rectangles.add(rectangle)
    );
    this.chart.lines.forEach(line => this.providers.lines.add(line));
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        main: new Camera2D()
      },
      resources: {},
      eventManagers: cameras => ({
        main: new BasicCamera2DController({
          camera: cameras.main,
          startView: ["main.main"]
        })
      }),
      pipeline: (_resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              main: createView(View2D, {
                camera: cameras.main,
                background: [0, 0, 0, 1],
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: [
              createLayer(RectangleLayer, {
                data: providers.rectangles,
                key: `rectangles`
              }),
              createLayer(EdgeLayer, {
                data: providers.lines,
                key: `lines`,
                type: EdgeType.LINE
              })
            ]
          }
        }
      })
    });
  }
}
