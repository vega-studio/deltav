import * as datGUI from "dat.gui";
import {
  ArcInstance,
  ArcLayer,
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
  View2D
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { PieChart } from "./pie-chart";

export class PieChartDemo extends BaseDemo {
  chart: PieChart;
  providers = {
    arcs: new InstanceProvider<ArcInstance>(),
    lines: new InstanceProvider<EdgeInstance>()
  };

  buildConsole(_gui: datGUI.GUI) {
    //
  }

  async init() {
    if (!this.surface) return;

    this.chart = new PieChart({
      center: [window.innerWidth / 2, window.innerHeight / 2],
      radius: 300,
      datas: [34, 22, 45, 67, 89],
      colors: ["blue", "yellow", "purple", "green", "red"]
    });

    this.addChartToProvider();
  }

  addChartToProvider() {
    this.chart.arcs.forEach(arc => this.providers.arcs.add(arc));
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
              createLayer(ArcLayer, {
                data: providers.arcs,
                key: `arcs`
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
