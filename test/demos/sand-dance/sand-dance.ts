import * as datGUI from "dat.gui";
import {
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
  LabelInstance,
  LabelLayer,
  RectangleInstance,
  RectangleLayer,
  ScaleMode,
  Vec2
} from "src";
import { BaseDemo } from "test/common/base-demo";
import { DEFAULT_RESOURCES } from "test/types";

export class SandDanceDemo extends BaseDemo {
  camera: ChartCamera;

  parameters = {
    color: [0, 0, 255, 1] as [number, number, number, number],
    width: 6
  };

  providers = {
    rectangles: new InstanceProvider<RectangleInstance>(),
    lines: new InstanceProvider<EdgeInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  rectangles: RectangleInstance[] = [];

  buildConsole(gui: datGUI.GUI) {
    const parameters = gui.addFolder("Parameters");

    parameters
      .addColor(this.parameters, "color")
      .onChange((value: [number, number, number, number]) => {
        this.rectangles.forEach(
          rec =>
            (rec.color = [value[0] / 255, value[1] / 255, value[2] / 255, 1])
        );
      });
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
                data: providers.rectangles
              })
            }
          }
        }
      })
    });
  }

  async init() {
    const totalNum = 1000;

    const bins = [0, 0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < totalNum; i++) {
      const index = Math.floor(Math.random() * 8);
      bins[index]++;
    }

    const origin: Vec2 = [100, 800];
    const chartWidth: number = 800;
    const chartHeight: number = 600;
    const binNum = 8;
    const binWidth = chartWidth / binNum;
    const rowNum: number = 8;

    // Rectangles
    for (let i = 0; i < bins.length; i++) {
      const binOrigin = [origin[0] + binWidth * i, origin[1]];

      for (let j = 0; j < bins[i]; j++) {
        const row = j % 8;
        const col = Math.floor(j / rowNum);
        const rec = new RectangleInstance({
          depth: 0,
          position: [binOrigin[0] + row * 11, binOrigin[1] - col * 11],
          size: [10, 10],
          scaling: ScaleMode.ALWAYS,
          color: this.parameters.color
        });

        this.providers.rectangles.add(rec);

        this.rectangles.push(rec);
      }
    }

    // Lines
    this.providers.lines.add(
      new EdgeInstance({
        start: [origin[0], origin[1] + 10],
        end: [origin[0] + chartWidth, origin[1] + 10]
      })
    );

    this.providers.lines.add(
      new EdgeInstance({
        start: [origin[0], origin[1] + 10],
        end: [origin[0], origin[1] - chartHeight + 10]
      })
    );

    // Labels
    this.providers.labels.add(
      new LabelInstance({
        text: "Test",
        color: [1, 1, 1, 1],
        origin: [100, 100],
        fontSize: 24
      })
    );
  }
}
