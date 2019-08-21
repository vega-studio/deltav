import * as datGUI from "dat.gui";
import {
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
import { FanInstance } from "./fan-shape/fan-instance";
import { FanLayer } from "./fan-shape/fan-layer";
import { PieChart } from "./pie-chart";

export class PieChartDemo extends BaseDemo {
  chart: PieChart;
  providers = {
    fans: new InstanceProvider<FanInstance>()
  };

  buildConsole(_gui: datGUI.GUI) {
    //
  }

  async init() {
    if (!this.surface) return;

    this.chart = new PieChart({
      center: [window.innerWidth / 2, window.innerHeight / 2],
      radius: 300,
      datas: [68, 22, 10, 6, 9],
      colors: [0x0000bb, 0xaa00bb, 0x00bb00, 0xbbbb00, 0xbb0000]
    });

    this.addChartToProvider();
  }

  addChartToProvider() {
    this.chart.fans.forEach(fan => this.providers.fans.add(fan));
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
              createLayer(FanLayer, {
                data: providers.fans,
                key: `fans`
              })
            ]
          }
        }
      })
    });
  }
}
