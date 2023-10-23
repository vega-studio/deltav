import {
  AutoEasingMethod,
  BasicSurface,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  Color,
  createFont,
  createLayer,
  createView,
  EdgeInstance,
  EdgeLayer,
  EdgeScaleType,
  EdgeType,
  FontMapGlyphType,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  PickType,
  ReferenceCamera2D,
  ScaleMode,
  TextureSize,
  View2D,
} from "../../../../src";
import { BaseDemo } from "../../common/base-demo";

const AXIS_VIEWSIZE = 40;
export const DEFAULT_BACKGROUND_COLOR: Color = [
  30 / 255,
  30 / 255,
  30 / 255,
  1.0,
];

export class ChartDemo extends BaseDemo {
  providers = {
    circles: new InstanceProvider<CircleInstance>(),
    labels: {
      xAxis: new InstanceProvider<LabelInstance>(),
      yAxis: new InstanceProvider<LabelInstance>(),
    },
    lines: {
      chart: new InstanceProvider<EdgeInstance>(),
      xAxis: new InstanceProvider<EdgeInstance>(),
      yAxis: new InstanceProvider<EdgeInstance>(),
    },
  };

  buildConsole() {
    // TODO
  }

  makeSurface(container: HTMLElement) {
    const oldColor = new Map();

    return new BasicSurface({
      container: container,
      providers: this.providers,
      cameras: {
        main: new Camera2D(),
      },
      resources: {
        font: {
          verdana: createFont({
            dynamic: true,
            fontMapSize: [TextureSize._2048, TextureSize._2048],
            fontSource: {
              family: "sans-serif",
              size: 32,
              type: FontMapGlyphType.BITMAP,
              weight: 400,
            },
          }),
        },
      },
      eventManagers: (_cameras) => ({}),
      scenes: (resources, providers, cameras) => ({
        // CHART SCENE
        chart: {
          views: {
            main: createView(View2D, {
              background: DEFAULT_BACKGROUND_COLOR,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              camera: cameras.main,
              viewport: {
                left: AXIS_VIEWSIZE,
                right: 0,
                top: 0,
                bottom: AXIS_VIEWSIZE,
              },
            }) as any,
          },

          layers: {
            circles: createLayer(CircleLayer, {
              animate: {
                radius: AutoEasingMethod.easeOutCubic(500),
              },
              data: providers.circles,
              usePoints: false,
              picking: PickType.SINGLE,

              onMouseOver: (info) => {
                info.instances.forEach((c) => {
                  oldColor.set(c, c.color);
                  c.color = [1, 1, 1, 1];
                });
              },

              onMouseOut: (info) => {
                info.instances.forEach((c) => {
                  c.color = oldColor.get(c) || [0, 0, 0, 1];
                  oldColor.delete(c);
                });
              },

              onMouseClick: (_info) => {
                // console.log(info.instances);
              },
            }),
            lines: createLayer(EdgeLayer, {
              data: providers.lines.chart,
              type: EdgeType.LINE,
              scaleType: EdgeScaleType.NONE,
            }),
          },
        },

        // XAXIS SCENE
        xAxis: {
          views: {
            main: createView(View2D, {
              background: DEFAULT_BACKGROUND_COLOR,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              camera: new ReferenceCamera2D({
                base: cameras.main,
              }),
              viewport: {
                left: 0,
                right: 0,
                bottom: 0,
                height: AXIS_VIEWSIZE,
              },
            }) as any,
          },
          layers: {
            lines: createLayer(EdgeLayer, {
              data: providers.lines.xAxis,
              type: EdgeType.LINE,
              scaleType: EdgeScaleType.SCREEN_CURVE,
            }),
            labels: createLayer(LabelLayer, {
              data: providers.labels.xAxis,
              resourceKey: resources.font.verdana.key,
              scaleMode: ScaleMode.NEVER,
            }),
          },
        },

        // YAXIS SCENE
        yAxis: {
          views: {
            main: createView(View2D, {
              background: DEFAULT_BACKGROUND_COLOR,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              camera: new ReferenceCamera2D({
                base: cameras.main,
              }),
              viewport: {
                left: 0,
                width: AXIS_VIEWSIZE,
                top: 0,
                bottom: AXIS_VIEWSIZE,
              },
            }) as any,
          },
          layers: {
            lines: createLayer(EdgeLayer, {
              data: providers.lines.yAxis,
              type: EdgeType.LINE,
              scaleType: EdgeScaleType.SCREEN_CURVE,
            }),
            labels: createLayer(LabelLayer, {
              data: providers.labels.yAxis,
              resourceKey: resources.font.verdana.key,
              scaleMode: ScaleMode.NEVER,
            }),
          },
        },
      }),
    });
  }

  async init() {
    // TODO
    for (let i = 0, iMax = 1000; i < iMax; ++i) {
      this.providers.circles.add(
        new CircleInstance({
          radius: Math.random() * 10 + 2,
          color: [0, Math.random() * 0.8 + 0.2, Math.random() * 0.8 + 0.2, 1],
          center: [Math.random() * 1000, Math.random() * 800],
        })
      );
    }
  }
}
