import * as datGUI from "dat.gui";
import {
  BasicSurface,
  BlockLayer,
  Camera,
  ClearFlags,
  createLayer,
  createView,
  IMouseInteraction,
  InstanceProvider,
  onAnimationLoop,
  SimpleEventHandler,
  stopAnimationLoop,
  Vec2,
  Vec3,
  Vec4,
  View3D
} from "src";
import { BaseDemo } from "../../common/base-demo";
import { BlockInstance } from "./block";
import { BucketDepthChart } from "./bucket-depth-chart";

export class BucketDepthChartDemo extends BaseDemo {
  providers = {
    blocks: new InstanceProvider<BlockInstance>()
  };

  front: boolean = true;
  bottomCenter: Vec2 = [0, 0];
  cameraCenter: Vec3 = [0, 0, 0];
  cameraPosition: Vec3 = [0, 0, 10];
  width: number = 10;
  viewWidth: number = 8;
  dragX: number = 0;
  mouseDown: boolean = false;
  mouseX: number = 0;
  bdc: BucketDepthChart;

  parameters = {
    frontView: () => {
      if (!this.surface) return;
      const camera = this.surface.cameras.perspective;
      const oldPosition = this.cameraPosition;
      const newPosition: Vec3 = [0, 0, 10];
      const delta = [
        newPosition[0] - oldPosition[0],
        newPosition[1] - oldPosition[1],
        newPosition[2] - oldPosition[2]
      ];
      let i = 0;
      const timeId = onAnimationLoop(() => {
        camera.position = [
          oldPosition[0] + delta[0] * i,
          oldPosition[1] + delta[1] * i,
          oldPosition[2] + delta[2] * i
        ];
        camera.lookAt(this.cameraCenter, [0, 1, 0]);
        if (i >= 1) stopAnimationLoop(timeId);
        i += 0.01;
      });
      this.cameraPosition = newPosition;
    },
    topView: () => {
      if (!this.surface) return;
      const camera = this.surface.cameras.perspective;
      const oldPosition = this.cameraPosition;
      const newPosition: Vec3 = [0, 10, 0.00001];
      const delta = [
        newPosition[0] - oldPosition[0],
        newPosition[1] - oldPosition[1],
        newPosition[2] - oldPosition[2]
      ];
      let i = 0;
      const timeId = onAnimationLoop(() => {
        camera.position = [
          oldPosition[0] + delta[0] * i,
          oldPosition[1] + delta[1] * i,
          oldPosition[2] + delta[2] * i
        ];
        camera.lookAt(this.cameraCenter, [0, 1, 0]);
        if (i >= 1) stopAnimationLoop(timeId);
        i += 0.01;
      });
      this.cameraPosition = newPosition;
    },
    angledView: () => {
      if (!this.surface) return;
      const camera = this.surface.cameras.perspective;
      const oldPosition = this.cameraPosition;
      const newPosition: Vec3 = [10, 10, 10];
      const delta = [
        newPosition[0] - oldPosition[0],
        newPosition[1] - oldPosition[1],
        newPosition[2] - oldPosition[2]
      ];
      let i = 0;
      const timeId = onAnimationLoop(() => {
        camera.position = [
          oldPosition[0] + delta[0] * i,
          oldPosition[1] + delta[1] * i,
          oldPosition[2] + delta[2] * i
        ];
        camera.lookAt(this.cameraCenter, [0, 1, 0]);
        if (i >= 1) stopAnimationLoop(timeId);
        i += 0.01;
      });
      this.cameraPosition = newPosition;
    },
    addData: () => {
      this.bdc.bars[4].addData([Math.random(), 3 + 3 * Math.random()]);
    }
  };

  buildConsole(gui: datGUI.GUI): void {
    gui.add(this.parameters, "frontView");
    gui.add(this.parameters, "topView");
    gui.add(this.parameters, "angledView");
    gui.add(this.parameters, "addData");
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
      [73 / 255, 45 / 255, 123 / 255, 0.8],
      [138 / 255, 53 / 255, 106 / 255, 0.8],
      [135 / 255, 78 / 255, 141 / 255, 0.8],
      [184 / 255, 88 / 255, 106 / 255, 0.8],
      [210 / 255, 151 / 255, 91 / 255, 0.8]
    ];

    this.bdc = new BucketDepthChart({
      maxDepth: 0,
      minDepth: -5,
      width: this.width,
      heightScale: 0.3,
      colors,
      chartData: data,
      resolution: 60,
      provider: this.providers.blocks,
      viewWidth: this.viewWidth
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
            this.mouseDown = true;
            this.mouseX = e.mouse.currentPosition[0];
          },
          handleMouseMove: (e: IMouseInteraction) => {
            if (this.mouseDown) {
              this.dragX += (e.mouse.currentPosition[0] - this.mouseX) / 100;
              this.dragX = Math.max(
                Math.min(this.dragX, 0),
                this.viewWidth - this.width
              );

              this.bdc.updateByDragX(this.dragX);
              this.mouseX = e.mouse.currentPosition[0];
            }
          },
          handleMouseUp: (e: IMouseInteraction) => {
            if (this.mouseDown) {
              this.dragX += (e.mouse.currentPosition[0] - this.mouseX) / 100;
              this.dragX = Math.max(
                Math.min(this.dragX, 0),
                this.viewWidth - this.width
              );
              this.bdc.updateByDragX(this.dragX);
              this.mouseDown = false;
            }
          },
          handleWheel: (e: IMouseInteraction) => {
            if (this.surface) {
              const camera = this.surface.cameras.perspective;
              camera.position = [
                0,
                0,
                camera.position[2] + e.mouse.wheel.delta[1] / 200
              ];
              camera.lookAt(this.cameraCenter, [0, 1, 0]);
              this.bdc.updateByCameraPosition(camera.position);
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
