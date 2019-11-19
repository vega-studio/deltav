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
  angleV: number = Math.PI / 2;
  angleH: number = 0;
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
  bdc1: BucketDepthChart;
  /*bdc2: BucketDepthChart;
  bdc3: BucketDepthChart;
  bdc4: BucketDepthChart;
  bdc5: BucketDepthChart;*/

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
    },
    lightAngleV: this.angleV * 180 / Math.PI,
    lightAngleH: this.angleH * 180 / Math.PI
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
  }

  async init() {
    if (!this.surface) return;

    const filter1 = new FIRFilter(
      [[0.15, 0], [0.1, 0], [0.5, 0], [0.15, 0], [0.15, 0]],
      1
    );

    /*const filter2 = new FIRFilter(
      [[0.2, 0], [0.1, 0], [0.1, 0], [0.15, 0], [0.15, 0]],
      1
    );

    const filter3 = new FIRFilter(
      [[0.4, 0], [0.1, 0], [0.5, 0], [0.15, 0], [0.5, 0]],
      1
    );

    const filter4 = new FIRFilter(
      [[0.5, 0], [0.5, 0], [0.5, 0], [0.15, 0], [0.15, 0]],
      1
    );

    const filter5 = new FIRFilter(
      [[0.1, 0], [0.1, 0], [0.5, 0], [0.5, 0], [0.5, 0]],
      1
    );*/

    const camera = this.surface.cameras.perspective;
    camera.position = [0, 0, 10];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    const datas: Vec3[][] = [];

    /*const data1: Vec3[][] = [];
    const data2: Vec3[][] = [];
    const data3: Vec3[][] = [];
    const data4: Vec3[][] = [];
    const data5: Vec3[][] = [];*/

    for (let i = 0; i < 5; i++) {
      /*data1[i] = [];
      data2[i] = [];
      data3[i] = [];
      data4[i] = [];
      data5[i] = [];*/
      datas[i] = [];

      for (let j = 0; j <= 100; j++) {
        const point1: Vec3 = [
          j / 100,
          3 + filter1.stream(3 * Math.random()),
          0.5 + 0.5 * Math.random()
        ];

        datas[i].push(point1);
        /*const point2: Vec3 = [
          j / 100,
          3 + filter2.stream(3 * Math.random()),
          0.5 + 0.5 * Math.random()
        ];
        data2[i].push(point2);
        const point3: Vec3 = [
          j / 100,
          3 + filter3.stream(3 * Math.random()),
          0.5 + 0.5 * Math.random()
        ];
        data3[i].push(point3);
        const point4: Vec3 = [
          j / 100,
          3 + filter4.stream(3 * Math.random()),
          0.5 + 0.5 * Math.random()
        ];
        data4[i].push(point4);
        const point5: Vec3 = [
          j / 100,
          3 + filter5.stream(3 * Math.random()),
          0.5 + 0.5 * Math.random()
        ];
        data5[i].push(point5);*/
      }
    }
    const alpha = 0.9;
    const colors: Vec4[] = [
      [73 / 255, 45 / 255, 123 / 255, alpha],
      [138 / 255, 53 / 255, 106 / 255, alpha],
      [135 / 255, 78 / 255, 141 / 255, alpha],
      [184 / 255, 88 / 255, 106 / 255, alpha],
      [210 / 255, 151 / 255, 91 / 255, alpha]
    ];

    /*const colors1: Vec4[] = [[73 / 255, 45 / 255, 123 / 255, alpha]];
    const colors2: Vec4[] = [[138 / 255, 53 / 255, 106 / 255, alpha]];
    const colors3: Vec4[] = [[135 / 255, 78 / 255, 141 / 255, alpha]];
    const colors4: Vec4[] = [[184 / 255, 88 / 255, 106 / 255, alpha]];
    const colors5: Vec4[] = [[210 / 255, 151 / 255, 91 / 255, alpha]];*/

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

    this.bdc1 = new BucketDepthChart({
      maxDepth: 0,
      minDepth: -4,
      width: this.width,
      heightScale: 0.3,
      colors: colors,
      chartData: datas,
      resolution: 60,
      provider: this.providers.blocks1,
      viewWidth: this.viewWidth,
      providers: blockProviders,
      endProviders: endPlateProviders
    });

    // this.bdc1.insertToProvider(this.providers.blocks1);

    /*this.bdc2 = new BucketDepthChart({
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

    this.bdc5.insertToProvider(this.providers.blocks5);*/
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
              /*this.bdc2.updateByDragX(this.dragX);
              this.bdc3.updateByDragX(this.dragX);
              this.bdc4.updateByDragX(this.dragX);
              this.bdc5.updateByDragX(this.dragX);*/
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
              /*this.bdc2.updateByDragX(this.dragX);
              this.bdc3.updateByDragX(this.dragX);
              this.bdc4.updateByDragX(this.dragX);
              this.bdc5.updateByDragX(this.dragX);*/
              this.mouseDown = false;
            }
          },
          handleWheel: (e: IMouseInteraction) => {
            this.zoomingDistance += e.mouse.wheel.delta[1] / 200;
            this.zoomingDistance = Math.max(0, this.zoomingDistance);
            this.bdc1.updateByCameraPosition([0, 0, this.zoomingDistance]);
            /*this.bdc2.updateByCameraPosition([0, 0, this.zoomingDistance]);
            this.bdc3.updateByCameraPosition([0, 0, this.zoomingDistance]);
            this.bdc4.updateByCameraPosition([0, 0, this.zoomingDistance]);
            this.bdc5.updateByCameraPosition([0, 0, this.zoomingDistance]);*/
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
