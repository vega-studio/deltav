import * as datGUI from "dat.gui";
import {
  BasicSurface,
  BlockInstance,
  BlockLayer,
  Camera,
  ClearFlags,
  createLayer,
  createView,
  IMouseInteraction,
  InstanceProvider,
  SimpleEventHandler,
  Vec2,
  Vec4,
  View3D
} from "src";
import { BaseDemo } from "../../common/base-demo";
import { BucketDepthChart } from "./bucket-depth-chart";

export class BucketDepthChartDemo extends BaseDemo {
  providers = {
    blocks: new InstanceProvider<BlockInstance>()
  };

  front: boolean = true;
  bottomCenter: Vec2 = [0, 0];
  dragX: number = 0;
  mouseDown: boolean = false;
  mouseX: number = 0;
  bdc: BucketDepthChart;

  parameters = {
    changeView: () => {
      if (!this.surface) return;
      const camera = this.surface.cameras.perspective;

      if (!this.front) {
        let i = 0;
        const timeId = setInterval(() => {
          i++;
          camera.position = [10 - i, 10 - i, 10];
          camera.lookAt([0, 0, 0], [0, 1, 0]);
          if (i >= 10) clearInterval(timeId);
        }, 100);
      } else {
        let i = 0;
        const timeId = setInterval(() => {
          i++;
          camera.position = [i, i, 10];
          camera.lookAt([0, 0, 0], [0, 1, 0]);
          if (i >= 10) clearInterval(timeId);
        }, 100);
      }

      this.front = !this.front;
    }
  };

  buildConsole(gui: datGUI.GUI): void {
    gui.add(this.parameters, "changeView");
  }

  async init() {
    if (!this.surface) return;

    // const transform = new Transform();
    const camera = this.surface.cameras.perspective;
    camera.position = [0, 0, 10];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    const data: Vec2[][] = [];

    for (let i = 0; i < 5; i++) {
      data[i] = [];
      for (let j = 0; j <= 100; j++) {
        const point: Vec2 = [j / 100, 3 + 3 * Math.random()];
        data[i].push(point);
      }
    }

    const colors: Vec4[] = [
      [73 / 255, 45 / 255, 123 / 255, 1],
      [138 / 255, 53 / 255, 106 / 255, 1],
      [135 / 255, 78 / 255, 141 / 255, 1],
      [184 / 255, 88 / 255, 106 / 255, 1],
      [210 / 255, 151 / 255, 91 / 255, 1]
    ];

    this.bdc = new BucketDepthChart({
      maxDepth: 0,
      minDepth: -5,
      width: 10,
      heightScale: 0.3,
      colors,
      chartData: data,
      resolution: 60,
      provider: this.providers.blocks
    });

    this.bdc.insertToProvider(this.providers.blocks);
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      providers: this.providers,
      rendererOptions: {
        antialias: true
      },
      cameras: {
        perspective: Camera.makePerspective({
          fov: 80 * Math.PI / 180,
          far: 100000,
          width: window.innerWidth,
          height: window.innerHeight
        })
      },
      resources: {},
      eventManagers: () => ({
        dragScreen: new SimpleEventHandler({
          handleMouseDown: (e: IMouseInteraction) => {
            if (this.front) {
              this.mouseDown = true;
              this.mouseX = e.mouse.currentPosition[0];
            }
          },
          handleMouseMove: (e: IMouseInteraction) => {
            if (this.front && this.mouseDown) {
              this.dragX += (e.mouse.currentPosition[0] - this.mouseX) / 100;
              this.bdc.updateByDragX(this.dragX);
              this.mouseX = e.mouse.currentPosition[0];
            }
          },
          handleMouseUp: (e: IMouseInteraction) => {
            if (this.front) {
              if (this.mouseDown) {
                this.dragX += (e.mouse.currentPosition[0] - this.mouseX) / 100;
                this.mouseDown = false;
              }
            }
          }
        })
      }),
      pipeline: (_resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              orthographic: createView(View3D, {
                camera: cameras.perspective,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: {
              blocks: createLayer(BlockLayer, {
                data: providers.blocks,
                cameraPosition: () => {
                  if (this.surface) {
                    return this.surface.cameras.perspective.position;
                  }

                  return [0, 0, 0];
                },
                bottomCenter: () => this.bottomCenter,
                dragX: () => this.dragX
              })
            }
          }
        }
      })
    });
  }
}
