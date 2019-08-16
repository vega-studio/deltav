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
import { BaseDemo } from "../../common/base-demo";
import { BarChart } from "./bar-chart";

export class BarChartDemo extends BaseDemo {
  chart: BarChart;
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

    this.chart = new BarChart({
      origin: [0, 500],
      barNames: ["a", "b", "c"],
      datas: [5, 6, 7],
      colors: ["blue", "red", "yellow"]
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
