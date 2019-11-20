import { FIRFilter } from "@diniden/signal-processing";
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
import { PlateEndInstance, PlateEndLayer } from "./plateEnd";

export class BucketDepthChartDemo extends BaseDemo {
  providers = {
    blocks1: new InstanceProvider<BlockInstance>(),
    blocks2: new InstanceProvider<BlockInstance>(),
    blocks3: new InstanceProvider<BlockInstance>(),
    blocks4: new InstanceProvider<BlockInstance>(),
    blocks5: new InstanceProvider<BlockInstance>(),
    ends1: new InstanceProvider<PlateEndInstance>(),
    ends2: new InstanceProvider<PlateEndInstance>(),
    ends3: new InstanceProvider<PlateEndInstance>(),
    ends4: new InstanceProvider<PlateEndInstance>(),
    ends5: new InstanceProvider<PlateEndInstance>()
  };

  front: boolean = true;
  bottomCenter: Vec2 = [0, 0];
  cameraCenter: Vec3 = [0, 0, 0];
  cameraPosition: Vec3 = [0, 0, 10];
  angleV: number = 100 * Math.PI / 180;
  angleH: number = 245 * Math.PI / 180;
  lightDirection: Vec3 = [
    Math.sin(this.angleV) * Math.cos(this.angleH),
    Math.cos(this.angleV),
    Math.sin(this.angleV) * Math.sin(this.angleH)
  ];
  zoomingDistance: number = 10;
  width: number = 10;
  viewWidth: number = 8;
  dragX: number = 0;
  mouseDown: boolean = false;
  mouseX: number = 0;
  bdc: BucketDepthChart;
  padding: number = 0.4;
  topView: boolean = false;

  parameters = {
    frontView: () => {
      if (!this.surface) return;
      this.topView = false;
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
        camera.lookAt([0, 0, this.bdc.middleDepth], [0, 1, 0]);
        if (i >= 1) stopAnimationLoop(timeId);
        i += 0.01;
      });
      this.cameraPosition = newPosition;
    },
    topView: () => {
      if (!this.surface) return;
      this.topView = true;
      const camera = this.surface.cameras.perspective;
      const oldPosition = this.cameraPosition;
      const newPosition: Vec3 = [0, 10, this.bdc.middleDepth + 0.00001];
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
        camera.lookAt([0, 0, this.bdc.middleDepth], [0, 1, 0]);
        if (i >= 1) stopAnimationLoop(timeId);
        i += 0.01;
      });
      this.cameraPosition = newPosition;
    },
    angledView: () => {
      if (!this.surface) return;
      this.topView = false;
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
        camera.lookAt([0, 0, this.bdc.middleDepth], [0, 1, 0]);
        if (i >= 1) stopAnimationLoop(timeId);
        i += 0.01;
      });
      this.cameraPosition = newPosition;
    },
    addData: () => {
      this.bdc.bars[4].addData([
        Math.random(),
        3 + 3 * Math.random(),
        1 + 2 * Math.random()
      ]);
    },
    lightAngleV: this.angleV * 180 / Math.PI,
    lightAngleH: this.angleH * 180 / Math.PI,
    padding: this.padding
  };

  buildConsole(gui: datGUI.GUI): void {
    gui.add(this.parameters, "frontView");
    gui.add(this.parameters, "topView");
    gui.add(this.parameters, "angledView");
    gui.add(this.parameters, "addData");
    gui
      .add(this.parameters, "lightAngleV", 0, 180)
      .onChange((angleV: number) => {
        this.angleV = angleV * Math.PI / 180;
        this.lightDirection = [
          Math.sin(this.angleV) * Math.cos(this.angleH),
          Math.cos(this.angleV),
          Math.sin(this.angleV) * Math.sin(this.angleH)
        ];
      });
    gui
      .add(this.parameters, "lightAngleH", 0, 360)
      .onChange((angleH: number) => {
        this.angleH = angleH * Math.PI / 180;
        this.lightDirection = [
          Math.sin(this.angleV) * Math.cos(this.angleH),
          Math.cos(this.angleV),
          Math.sin(this.angleV) * Math.sin(this.angleH)
        ];
      });
    gui.add(this.parameters, "padding", 0, 2).onChange((val: number) => {
      this.bdc.padding = val;
      if (!this.surface) return;
      const camera = this.surface.cameras.perspective;
      if (this.topView) {
        camera.position = [0, 10, this.bdc.middleDepth + 0.00001];
      }
      camera.lookAt([0, 0, this.bdc.middleDepth], [0, 1, 0]);
    });
  }

  async init() {
    if (!this.surface) return;

    const heightFilter = new FIRFilter(
      [[0.15, 0], [0.1, 0], [0.5, 0], [0.15, 0], [0.15, 0]],
      1
    );

    const depthFilter = new FIRFilter(
      [[0.3, 0], [0.2, 0], [0.1, 0], [0.15, 0], [0.25, 0]],
      1
    );

    const camera = this.surface.cameras.perspective;
    camera.position = [0, 0, 10];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    const datas: Vec3[][] = [[], [], [], [], []];

    // bar 0 data
    for (let j = 0; j <= 500; j++) {
      const point1: Vec3 = [
        j / 100,
        j % 100 < 40
          ? heightFilter.stream(1 + 3 * Math.random())
          : heightFilter.stream(6 + 4 * Math.random()),
        depthFilter.stream(0.5 + 0.5 * Math.random())
      ];

      datas[0].push(point1);
    }

    // bar 1 data
    for (let j = 0; j <= 700; j++) {
      const point1: Vec3 = [
        j / 100,
        j % 100 > 80
          ? heightFilter.stream(2 + 3 * Math.random())
          : heightFilter.stream(9 + 4 * Math.random()),
        depthFilter.stream(0.1 + 0.6 * Math.random())
      ];

      datas[1].push(point1);
    }
    // bar 2 data
    for (let j = 0; j <= 1000; j++) {
      const point1: Vec3 = [
        j / 100,
        j % 100 > 30 && j % 100 < 50
          ? heightFilter.stream(3 + 3 * Math.random())
          : heightFilter.stream(7 + 4 * Math.random()),
        depthFilter.stream(0.05 + 0.9 * Math.random())
      ];

      datas[2].push(point1);
    }
    // bar 3 data
    for (let j = 0; j <= 200; j++) {
      const point1: Vec3 = [
        j / 100,
        j % 100 < 15
          ? heightFilter.stream(Math.random())
          : heightFilter.stream(4 + 4 * Math.random()),
        j % 100 < 50
          ? depthFilter.stream(0.6 + 0.1 * Math.random())
          : depthFilter.stream(0.1 + 0.1 * Math.random())
      ];

      datas[3].push(point1);
    }
    // bar 4 data
    for (let j = 0; j <= 400; j++) {
      const point1: Vec3 = [
        j / 100,
        j % 100 < 70 && j % 100 > 60
          ? heightFilter.stream(4 + 3 * Math.random())
          : heightFilter.stream(4 * Math.random()),
        0
      ];

      datas[4].push(point1);
    }

    const alpha = 0.9;
    const colors: Vec4[] = [
      [73 / 255, 45 / 255, 123 / 255, alpha],
      [138 / 255, 53 / 255, 106 / 255, alpha],
      [135 / 255, 78 / 255, 141 / 255, alpha],
      [184 / 255, 88 / 255, 106 / 255, alpha],
      [210 / 255, 151 / 255, 91 / 255, alpha]
    ];

    const blockProviders: InstanceProvider<BlockInstance>[] = [
      this.providers.blocks1,
      this.providers.blocks2,
      this.providers.blocks3,
      this.providers.blocks4,
      this.providers.blocks5
    ];

    const endPlateProviders: InstanceProvider<PlateEndInstance>[] = [
      this.providers.ends1,
      this.providers.ends2,
      this.providers.ends3,
      this.providers.ends4,
      this.providers.ends5
    ];

    this.bdc = new BucketDepthChart({
      baseDepth: 0,
      width: this.width,
      heightScale: 0.3,
      colors: colors,
      chartData: datas,
      resolution: 100,
      viewWidth: this.viewWidth,
      padding: this.padding,
      providers: blockProviders,
      endProviders: endPlateProviders
    });
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
            this.zoomingDistance += e.mouse.wheel.delta[1] / 200;
            this.zoomingDistance = Math.max(0, this.zoomingDistance);
            this.bdc.updateByCameraPosition([0, 0, this.zoomingDistance]);
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
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              end1: createLayer(PlateEndLayer, {
                data: providers.ends1,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              blocks2: createLayer(BlockLayer, {
                data: providers.blocks2,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              end2: createLayer(PlateEndLayer, {
                data: providers.ends2,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              blocks3: createLayer(BlockLayer, {
                data: providers.blocks3,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              end3: createLayer(PlateEndLayer, {
                data: providers.ends3,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              blocks4: createLayer(BlockLayer, {
                data: providers.blocks4,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              end4: createLayer(PlateEndLayer, {
                data: providers.ends4,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              blocks5: createLayer(BlockLayer, {
                data: providers.blocks5,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              }),
              end5: createLayer(PlateEndLayer, {
                data: providers.ends5,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection
              })
            }
          }
        }
      })
    });
  }
}
