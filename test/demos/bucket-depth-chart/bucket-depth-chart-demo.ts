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
    blocks1: new InstanceProvider<BlockInstance>(),
    blocks2: new InstanceProvider<BlockInstance>(),
    blocks3: new InstanceProvider<BlockInstance>(),
    blocks4: new InstanceProvider<BlockInstance>(),
    blocks5: new InstanceProvider<BlockInstance>()
  };

  front: boolean = true;
  bottomCenter: Vec2 = [0, 0];
  cameraCenter: Vec3 = [0, 0, 0];
  cameraPosition: Vec3 = [0, 0, 10];
  zoomingDistance: number = 10;
  width: number = 10;
  viewWidth: number = 8;
  dragX: number = 0;
  mouseDown: boolean = false;
  mouseX: number = 0;
  bdc1: BucketDepthChart;
  bdc2: BucketDepthChart;
  bdc3: BucketDepthChart;
  bdc4: BucketDepthChart;
  bdc5: BucketDepthChart;

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
      this.bdc1.bars[4].addData([
        Math.random(),
        3 + 3 * Math.random(),
        1 + 2 * Math.random()
      ]);
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

    const data1: Vec3[][] = [];
    const data2: Vec3[][] = [];
    const data3: Vec3[][] = [];
    const data4: Vec3[][] = [];
    const data5: Vec3[][] = [];

    for (let i = 0; i < 1; i++) {
      data1[i] = [];
      data2[i] = [];
      data3[i] = [];
      data4[i] = [];
      data5[i] = [];

      for (let j = 0; j <= 100; j++) {
        const point1: Vec3 = [
          j / 100,
          3 + 3 * Math.random(),
          0.5 + 0.5 * Math.random()
        ];
        data1[i].push(point1);
        const point2: Vec3 = [
          j / 100,
          3 + 3 * Math.random(),
          0.5 + 0.5 * Math.random()
        ];
        data2[i].push(point2);
        const point3: Vec3 = [
          j / 100,
          3 + 3 * Math.random(),
          0.5 + 0.5 * Math.random()
        ];
        data3[i].push(point3);
        const point4: Vec3 = [
          j / 100,
          3 + 3 * Math.random(),
          0.5 + 0.5 * Math.random()
        ];
        data4[i].push(point4);
        const point5: Vec3 = [
          j / 100,
          3 + 3 * Math.random(),
          0.5 + 0.5 * Math.random()
        ];
        data5[i].push(point5);
      }
    }
    const alpha = 0.9;
    const colors1: Vec4[] = [[73 / 255, 45 / 255, 123 / 255, alpha]];
    const colors2: Vec4[] = [[138 / 255, 53 / 255, 106 / 255, alpha]];
    const colors3: Vec4[] = [[135 / 255, 78 / 255, 141 / 255, alpha]];
    const colors4: Vec4[] = [[184 / 255, 88 / 255, 106 / 255, alpha]];
    const colors5: Vec4[] = [[210 / 255, 151 / 255, 91 / 255, alpha]];

    this.bdc1 = new BucketDepthChart({
      maxDepth: -4,
      minDepth: -4,
      width: this.width,
      heightScale: 0.3,
      colors: colors1,
      chartData: data1,
      resolution: 60,
      provider: this.providers.blocks1,
      viewWidth: this.viewWidth
    });

    this.bdc1.insertToProvider(this.providers.blocks1);

    this.bdc2 = new BucketDepthChart({
      maxDepth: -3,
      minDepth: -3,
      width: this.width,
      heightScale: 0.3,
      colors: colors2,
      chartData: data2,
      resolution: 60,
      provider: this.providers.blocks2,
      viewWidth: this.viewWidth
    });

    this.bdc2.insertToProvider(this.providers.blocks2);

    this.bdc3 = new BucketDepthChart({
      maxDepth: -2,
      minDepth: -2,
      width: this.width,
      heightScale: 0.3,
      colors: colors3,
      chartData: data3,
      resolution: 60,
      provider: this.providers.blocks3,
      viewWidth: this.viewWidth
    });

    this.bdc3.insertToProvider(this.providers.blocks3);

    this.bdc4 = new BucketDepthChart({
      maxDepth: -1,
      minDepth: -1,
      width: this.width,
      heightScale: 0.3,
      colors: colors4,
      chartData: data4,
      resolution: 60,
      provider: this.providers.blocks4,
      viewWidth: this.viewWidth
    });

    this.bdc4.insertToProvider(this.providers.blocks4);

    this.bdc5 = new BucketDepthChart({
      maxDepth: 0,
      minDepth: 0,
      width: this.width,
      heightScale: 0.3,
      colors: colors5,
      chartData: data5,
      resolution: 60,
      provider: this.providers.blocks5,
      viewWidth: this.viewWidth
    });

    this.bdc5.insertToProvider(this.providers.blocks5);
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

              this.bdc1.updateByDragX(this.dragX);
              this.bdc2.updateByDragX(this.dragX);
              this.bdc3.updateByDragX(this.dragX);
              this.bdc4.updateByDragX(this.dragX);
              this.bdc5.updateByDragX(this.dragX);
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
              this.bdc1.updateByDragX(this.dragX);
              this.bdc2.updateByDragX(this.dragX);
              this.bdc3.updateByDragX(this.dragX);
              this.bdc4.updateByDragX(this.dragX);
              this.bdc5.updateByDragX(this.dragX);
              this.mouseDown = false;
            }
          },
          handleWheel: (e: IMouseInteraction) => {
            this.zoomingDistance += e.mouse.wheel.delta[1] / 200;
            this.bdc1.updateByCameraPosition([0, 0, this.zoomingDistance]);
            this.bdc2.updateByCameraPosition([0, 0, this.zoomingDistance]);
            this.bdc3.updateByCameraPosition([0, 0, this.zoomingDistance]);
            this.bdc4.updateByCameraPosition([0, 0, this.zoomingDistance]);
            this.bdc5.updateByCameraPosition([0, 0, this.zoomingDistance]);
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
              blocks1: createLayer(BlockLayer, {
                data: providers.blocks1,
                cameraPosition: () => {
                  if (this.surface) {
                    return this.surface.cameras.perspective.position;
                  }

                  return [0, 0, 0];
                },
                bottomCenter: () => this.bottomCenter
              }),
              blocks2: createLayer(BlockLayer, {
                data: providers.blocks2,
                cameraPosition: () => {
                  if (this.surface) {
                    return this.surface.cameras.perspective.position;
                  }

                  return [0, 0, 0];
                },
                bottomCenter: () => this.bottomCenter
              }),
              blocks3: createLayer(BlockLayer, {
                data: providers.blocks3,
                cameraPosition: () => {
                  if (this.surface) {
                    return this.surface.cameras.perspective.position;
                  }

                  return [0, 0, 0];
                },
                bottomCenter: () => this.bottomCenter
              }),
              blocks4: createLayer(BlockLayer, {
                data: providers.blocks4,
                cameraPosition: () => {
                  if (this.surface) {
                    return this.surface.cameras.perspective.position;
                  }

                  return [0, 0, 0];
                },
                bottomCenter: () => this.bottomCenter
              }),
              blocks5: createLayer(BlockLayer, {
                data: providers.blocks5,
                cameraPosition: () => {
                  if (this.surface) {
                    return this.surface.cameras.perspective.position;
                  }

                  return [0, 0, 0];
                },
                bottomCenter: () => this.bottomCenter
              })
            }
          }
        }
      })
    });
  }
}
