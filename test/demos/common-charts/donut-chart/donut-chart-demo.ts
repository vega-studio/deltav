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
  InstanceProvider,
  View2D
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { DonutChart } from "./donut-chart";

export class DonutChartDemo extends BaseDemo {
  chart: DonutChart;
  providers = {
    arcs: new InstanceProvider<ArcInstance>()
  };

  buildConsole(_gui: datGUI.GUI) {
    //
  }

  async init() {
    if (!this.surface) return;

    this.chart = new DonutChart({
      center: [window.innerWidth / 2, window.innerHeight / 2],
      outerRadius: 300,
      innerRadius: 50,
      datas: [68, 34, 12, 9, 100],
      colors: [0x0000bb, 0xaa00bb, 0x00bb00, 0xbbbb00, 0xbb0000]
    });

    this.addChartToProvider();
  }

  addChartToProvider() {
    this.chart.arcs.forEach(arc => this.providers.arcs.add(arc));
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
                background: [1, 1, 1, 1],
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: [
              createLayer(ArcLayer, {
                data: providers.arcs,
                key: `arcs`
              })
            ]
          }
        }
      })
    });
  }
}
