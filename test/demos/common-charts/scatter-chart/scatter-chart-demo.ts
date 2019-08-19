import * as datGUI from "dat.gui";
import {
  BasicCamera2DController,
  BasicSurface,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  View2D
} from "src";
import { BaseDemo } from "../../../common/base-demo";
import { ScatterChart } from "./scatter-chart";

export class ScatterChatDemo extends BaseDemo {
  chart: ScatterChart;

  providers = {
    circles: new InstanceProvider<CircleInstance>(),
    lines: new InstanceProvider<EdgeInstance>()
  };

  buildConsole(_gui: datGUI.GUI) {
    //
  }

  async init() {
    if (!this.surface) return;

    this.chart = new ScatterChart({
      origin: [window.innerWidth / 2, window.innerHeight / 2],
      width: window.innerWidth * 0.9,
      height: window.innerHeight * 0.9,
      color: "yellow",
      datas: [[10, 45], [-20, -89], [18, -108], [-200, 300]]
    });

    this.addChartToProvider();
  }

  addChartToProvider() {
    this.chart.circles.forEach(circle => this.providers.circles.add(circle));
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
              createLayer(CircleLayer, {
                data: providers.circles,
                key: `circles`
              }),
              createLayer(EdgeLayer, {
                data: providers.lines,
                key: `line`,
                type: EdgeType.LINE
              })
            ]
          }
        }
      })
    });
  }
}
