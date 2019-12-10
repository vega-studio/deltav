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

function getGroupSizeByDistance(distance: number) {
  if (distance <= 500) return 1;

  if (distance <= 570) return 2;

  if (distance <= 600) return 4;

  if (distance <= 620) return 8;

  if (distance <= 640) return 12;

  return 16;
}

export class BucketDepthChartDemo extends BaseDemo {
  providers = {
    blocks1: new InstanceProvider<BlockInstance>(),
    blocks2: new InstanceProvider<BlockInstance>(),
    blocks3: new InstanceProvider<BlockInstance>(),
    blocks4: new InstanceProvider<BlockInstance>(),
    blocks5: new InstanceProvider<BlockInstance>(),
    blocks6: new InstanceProvider<BlockInstance>(),
    blocks7: new InstanceProvider<BlockInstance>(),
    blocks8: new InstanceProvider<BlockInstance>(),
    blocks9: new InstanceProvider<BlockInstance>(),
    blocks10: new InstanceProvider<BlockInstance>(),
    ends1: new InstanceProvider<PlateEndInstance>(),
    ends2: new InstanceProvider<PlateEndInstance>(),
    ends3: new InstanceProvider<PlateEndInstance>(),
    ends4: new InstanceProvider<PlateEndInstance>(),
    ends5: new InstanceProvider<PlateEndInstance>(),
    ends6: new InstanceProvider<PlateEndInstance>(),
    ends7: new InstanceProvider<PlateEndInstance>(),
    ends8: new InstanceProvider<PlateEndInstance>(),
    ends9: new InstanceProvider<PlateEndInstance>(),
    ends10: new InstanceProvider<PlateEndInstance>()
  };

  front: boolean = true;
  bottomCenter: Vec2 = [0, 0];
  cameraCenter: Vec3 = [0, 0, 0];
  cameraPosition: Vec3 = [0, 0, 15];
  angleV: number = 100 * Math.PI / 180;
  angleH: number = 245 * Math.PI / 180;
  lightDirection: Vec3 = [
    Math.sin(this.angleV) * Math.cos(this.angleH),
    Math.cos(this.angleV),
    Math.sin(this.angleV) * Math.sin(this.angleH)
  ];
  zoomingDistance: number = 10;
  unitWidth: number = 1;
  viewWidth: number = 8;
  scaleX: number = 1;
  dragX: number = 0;
  dragZ: number = 0;
  mouseDown: boolean = false;
  mouseX: number = 0;
  mouseY: number = 0;
  bdc: BucketDepthChart;
  padding: number = 1;
  topView: boolean = false;
  gui: dat.GUI;
  numOfBars: number = 5;

  startTime: number = 10;
  curTime: number = 10;
  streamId: number = -1;

  heightFilter = new FIRFilter(
    [[0.15, 0], [0.1, 0], [0.5, 0], [0.15, 0], [0.15, 0]],
    1
  );

  depthFilter = new FIRFilter(
    [[0.3, 0], [0.2, 0], [0.1, 0], [0.15, 0], [0.25, 0]],
    1
  );

  parameters = {
    frontView: () => {
      this.topView = false;
      this.front = true;
      this.moveCameraTo([0, 0, 10]);
    },
    topView: () => {
      if (!this.surface) return;
      this.topView = true;
      this.front = false;
      const camera = this.surface.cameras.perspective;
      const oldPosition = this.cameraPosition;
      // const distance = (this.bdc.maxDepth - this.bdc.minDepth) / 2;
      const distance = Math.min(
        Math.max(this.bdc.maxDepth - this.bdc.minDepth, 5),
        12
      );
      const newPosition: Vec3 = [0, distance, this.bdc.middleDepth + 0.5];
      const delta = [
        newPosition[0] - oldPosition[0],
        newPosition[1] - oldPosition[1],
        newPosition[2] - oldPosition[2]
      ];
      let i = 0;
      let deltai = 0.01;
      const oldAngleH = this.angleH;
      const oldAngleV = this.angleV;
      const deltaH = -this.angleH;
      const deltaV = -this.angleV;
      const timeId = onAnimationLoop(() => {
        camera.position = [
          oldPosition[0] + delta[0] * i,
          oldPosition[1] + delta[1] * i,
          oldPosition[2] + delta[2] * i
        ];
        camera.lookAt([0, 0, this.bdc.middleDepth], [0, 1, 0]);

        const angleH = oldAngleH + deltaH * i;
        const angleV = oldAngleV + deltaV * i;

        this.lightDirection = [
          Math.sin(angleV) * Math.cos(angleH),
          Math.cos(angleV),
          Math.sin(angleV) * Math.sin(angleH)
        ];

        if (i >= 1) stopAnimationLoop(timeId);
        i += deltai;
        if (i >= 0.8) deltai = 0.005;
      });

      this.cameraPosition = newPosition;
      this.angleH = 0;
      this.angleV = 0;
      this.gui.updateDisplay();
    },
    angledView: () => {
      this.topView = false;
      this.front = false;
      const distance = Math.min(
        Math.max(this.bdc.maxDepth - this.bdc.minDepth, 5),
        12
      );
      if (this.bdc.bars.length === 1) {
        this.moveCameraTo([5, 5, this.bdc.middleDepth + 5]);
      } else {
        this.moveCameraTo([
          distance,
          distance,
          this.bdc.middleDepth + distance
        ]);
      }
    },
    addData: () => {
      this.bdc.bars.forEach(bar =>
        bar.addData([Math.random(), 3 + 3 * Math.random(), 0])
      );
    },
    stream: () => {
      const dragEnd = this.viewWidth - this.scaleX * this.bdc.width;
      const dragStart = this.dragX;
      const delta = dragEnd - dragStart;
      let i = 0;
      const timeId = onAnimationLoop(() => {
        this.dragX = dragStart + delta * i;
        this.bdc.updateByDragX(this.dragX);
        if (i >= 1) {
          stopAnimationLoop(timeId);

          // Add data
          this.streamId = onAnimationLoop(() => {
            this.curTime += Math.random();
            this.bdc.bars.forEach(bar => {
              bar.addData([
                this.curTime,
                Math.random() > 0.5 ? 3 + 2 * Math.random() : Math.random(),
                0.5 + 0.5 * Math.random()
              ]);
            });

            this.dragX =
              this.viewWidth -
              (this.curTime - this.startTime) * this.unitWidth * this.scaleX;
            this.bdc.updateByDragX(this.dragX);
          }, 100);
        }
        i += 0.01;
      });
    },
    stopStream: () => {
      stopAnimationLoop(this.streamId);
    },
    lightAngleV: this.angleV * 180 / Math.PI,
    lightAngleH: this.angleH * 180 / Math.PI,
    padding: this.padding,
    numOfBars: this.numOfBars
  };

  buildConsole(gui: datGUI.GUI): void {
    gui.add(this.parameters, "frontView");
    gui.add(this.parameters, "topView");
    gui.add(this.parameters, "angledView");
    gui.add(this.parameters, "stream");
    gui.add(this.parameters, "stopStream");
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
        camera.position = [0, 10, this.bdc.middleDepth + 0.5];
      }
      camera.lookAt([0, 0, this.bdc.middleDepth], [0, 1, 0]);
    });
    gui.add(this.parameters, "numOfBars", 0, 10, 1).onChange((val: number) => {
      if (val !== this.numOfBars) {
        if (val > this.numOfBars) {
          this.addBar(this.numOfBars, val);
        } else if (val < this.numOfBars) {
          this.reduceBar(this.numOfBars, val);
        }

        this.bdc.viewPortFar = this.bdc.maxDepth;
        this.bdc.viewPortNear = this.bdc.minDepth;
        this.bdc.updateByDragZ(this.dragZ);
        this.numOfBars = val;

        const distance = Math.min(
          Math.max(this.bdc.maxDepth - this.bdc.minDepth, 5),
          12
        );

        if (this.surface) {
          const camera = this.surface.cameras.perspective;

          if (this.front) {
            camera.position = [0, 0, 15];
          } else if (this.topView) {
            camera.position = [0, distance, this.bdc.middleDepth + 0.5];
          } else {
            if (this.bdc.bars.length === 1) {
              camera.position = [4, 4, this.bdc.middleDepth + 4];
            } else {
              camera.position = [
                distance,
                distance,
                this.bdc.middleDepth + distance
              ];
            }
          }
        }
      }
    });

    this.gui = gui;
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.perspective;
    camera.position = [0, 0, 15];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    const datas: Vec3[][] = [[], [], [], [], []];

    // bar 0 data
    for (let j = 10; j < 250; j++) {
      const point1: Vec3 = [
        this.startTime + j,
        j % 100 < 40
          ? this.heightFilter.stream(1 + 3 * Math.random())
          : this.heightFilter.stream(6 + 4 * Math.random()),
        this.depthFilter.stream(0.5 + 0.5 * Math.random())
      ];

      datas[0].push(point1);

      this.curTime = Math.max(this.curTime, this.startTime + j);
    }

    // bar 1 data
    for (let j = 5; j < 150; j++) {
      const point1: Vec3 = [
        this.startTime + j,
        j % 100 > 80
          ? this.heightFilter.stream(2 + 3 * Math.random())
          : this.heightFilter.stream(9 + 4 * Math.random()),
        this.depthFilter.stream(0.1 + 0.6 * Math.random())
      ];

      datas[1].push(point1);
      this.curTime = Math.max(this.curTime, this.startTime + j);
    }
    // bar 2 data
    for (let j = 0; j < 300; j++) {
      const point1: Vec3 = [
        this.startTime + j,
        j % 100 > 30 && j % 100 < 50
          ? this.heightFilter.stream(3 + 3 * Math.random())
          : this.heightFilter.stream(7 + 4 * Math.random()),
        this.depthFilter.stream(0.05 + 0.9 * Math.random())
      ];

      datas[2].push(point1);
      this.curTime = Math.max(this.curTime, this.startTime + j);
    }
    // bar 3 data
    for (let j = 15; j < 200; j++) {
      const point1: Vec3 = [
        this.startTime + j,
        j % 100 < 15
          ? this.heightFilter.stream(Math.random())
          : this.heightFilter.stream(4 + 4 * Math.random()),
        j % 100 < 50
          ? this.depthFilter.stream(0.6 + 0.1 * Math.random())
          : this.depthFilter.stream(0.1 + 0.1 * Math.random())
      ];

      datas[3].push(point1);
      this.curTime = Math.max(this.curTime, this.startTime + j);
    }
    // bar 4 data
    for (let j = 0; j < 100; j++) {
      const point1: Vec3 = [
        this.startTime + j,
        j % 50 < 35
          ? this.heightFilter.stream(4 + 3 * Math.random())
          : this.heightFilter.stream(4 * Math.random()),
        0
      ];

      datas[4].push(point1);
      this.curTime = Math.max(this.curTime, this.startTime + j);
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
      this.providers.blocks5,
      this.providers.blocks6,
      this.providers.blocks7,
      this.providers.blocks8,
      this.providers.blocks9,
      this.providers.blocks10
    ];

    const endPlateProviders: InstanceProvider<PlateEndInstance>[] = [
      this.providers.ends1,
      this.providers.ends2,
      this.providers.ends3,
      this.providers.ends4,
      this.providers.ends5,
      this.providers.ends6,
      this.providers.ends7,
      this.providers.ends8,
      this.providers.ends9,
      this.providers.ends10
    ];

    this.bdc = new BucketDepthChart({
      baseDepth: 0,
      startTime: this.startTime,
      unitWidth: this.unitWidth,
      heightScale: 0.3,
      colors: colors,
      chartData: datas,
      viewWidth: this.viewWidth,
      viewPortNear: -10,
      viewPortFar: 9,
      padding: this.padding,
      providers: blockProviders,
      endProviders: endPlateProviders,
      heightFilter: this.heightFilter,
      depthFilter: this.depthFilter
    });
  }

  moveCameraTo(pos: Vec3) {
    if (!this.surface) return;
    const camera = this.surface.cameras.perspective;
    const oldPosition = this.cameraPosition;
    const newPosition: Vec3 = pos;
    const delta = [
      newPosition[0] - oldPosition[0],
      newPosition[1] - oldPosition[1],
      newPosition[2] - oldPosition[2]
    ];

    let i = 0;
    const deltai = 0.01;

    const timeId = onAnimationLoop(() => {
      camera.position = [
        oldPosition[0] + delta[0] * i,
        oldPosition[1] + delta[1] * i,
        oldPosition[2] + delta[2] * i
      ];
      camera.lookAt([0, 0, this.bdc.middleDepth], [0, 1, 0]);
      if (i >= 1) stopAnimationLoop(timeId);
      i += deltai;
    });

    this.cameraPosition = newPosition;
  }

  addBar(pre: number, now: number) {
    for (let i = pre; i < now; i++) {
      // data
      const barData = [];
      const a = Math.floor(Math.random() * 50) + 20;
      const b = Math.floor(Math.random() * 10) + 10;

      for (let j = 0; j <= 200; j++) {
        const point: Vec3 = [
          j + this.startTime,
          j % a < b
            ? this.heightFilter.stream(4 + 3 * Math.random())
            : this.heightFilter.stream(4 * Math.random()),
          this.depthFilter.stream(4 * Math.random())
        ];

        barData.push(point);
      }

      // color
      const color: Vec4 = [Math.random(), Math.random(), Math.random(), 0.9];

      this.bdc.addBar(barData, color, i);
    }
  }

  reduceBar(pre: number, now: number) {
    for (let i = pre; i > now; i--) {
      this.bdc.reduceBar();
    }
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
            this.mouseY = e.mouse.currentPosition[1];
          },
          handleMouseMove: (e: IMouseInteraction) => {
            if (!this.surface) return;

            if (this.mouseDown) {
              const currentMouseX = e.mouse.currentPosition[0];
              const currentMouseY = e.mouse.currentPosition[1];

              if (
                Math.abs(currentMouseX - this.mouseX) >
                Math.abs(currentMouseY - this.mouseY)
              ) {
                this.dragX += (currentMouseX - this.mouseX) / 100;
                this.dragX = Math.max(
                  Math.min(this.dragX, 0),
                  this.viewWidth - this.bdc.width * this.scaleX
                );
                this.bdc.updateByDragX(this.dragX);
              } else {
                this.dragZ += (currentMouseY - this.mouseY) / 100;
                this.bdc.updateByDragZ(this.dragZ);
              }

              this.mouseX = currentMouseX;
              this.mouseY = currentMouseY;
            }
          },
          handleMouseUp: (e: IMouseInteraction) => {
            if (this.mouseDown) {
              this.dragX += (e.mouse.currentPosition[0] - this.mouseX) / 100;
              this.dragX = Math.max(
                Math.min(this.dragX, 0),
                this.viewWidth - this.bdc.width * this.scaleX
              );
              this.bdc.updateByDragX(this.dragX);
              this.mouseDown = false;
            }
          },
          handleWheel: (e: IMouseInteraction) => {
            this.zoomingDistance += e.mouse.wheel.delta[1] * 60 / 1000;
            this.zoomingDistance = Math.min(
              Math.max(0, this.zoomingDistance),
              700
            );

            // ScaleX
            const preScale = this.scaleX;
            this.scaleX -= e.mouse.wheel.delta[1] / 10000;
            this.scaleX = Math.min(
              Math.max(this.scaleX, this.viewWidth / this.bdc.width),
              1.0
            );

            if (this.front) {
              // Real ends
              const leftEnd = this.dragX - this.viewWidth / 2;
              const rightEnd = leftEnd + this.bdc.width;

              if (rightEnd > leftEnd) {
                // mouseX
                const p1 = e.start.view.projection.worldToScreen([
                  leftEnd,
                  0,
                  0
                ]);
                const p2 = e.start.view.projection.worldToScreen([
                  rightEnd,
                  0,
                  0
                ]);
                const mouseX = e.mouse.currentPosition[0];

                // anchor position
                const anchorScale = (mouseX - p1[0]) / (p2[0] - p1[0]);
                const anchorX = leftEnd + anchorScale * this.bdc.width;

                // new left end
                const newLeftEnd =
                  anchorX + (leftEnd - anchorX) * this.scaleX / preScale;

                this.dragX = newLeftEnd + this.viewWidth / 2;
              }

              // Drag X update
              this.dragX = Math.max(
                Math.min(this.dragX, 0),
                this.viewWidth - this.bdc.width * this.scaleX
              );
            }

            // Resolution update
            const groupSize = getGroupSizeByDistance(this.zoomingDistance);
            this.bdc.updateByScaleX(this.scaleX, this.dragX, groupSize);
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
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[0] ? this.bdc.bars[0].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end1: createLayer(PlateEndLayer, {
                data: providers.ends1,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[0] ? this.bdc.bars[0].color : [0, 0, 0, 0]
              }),
              blocks2: createLayer(BlockLayer, {
                data: providers.blocks2,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[1] ? this.bdc.bars[1].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end2: createLayer(PlateEndLayer, {
                data: providers.ends2,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[1] ? this.bdc.bars[1].color : [0, 0, 0, 0]
              }),
              blocks3: createLayer(BlockLayer, {
                data: providers.blocks3,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[2] ? this.bdc.bars[2].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end3: createLayer(PlateEndLayer, {
                data: providers.ends3,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[2] ? this.bdc.bars[2].color : [0, 0, 0, 0]
              }),
              blocks4: createLayer(BlockLayer, {
                data: providers.blocks4,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[3] ? this.bdc.bars[3].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end4: createLayer(PlateEndLayer, {
                data: providers.ends4,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[3] ? this.bdc.bars[3].color : [0, 0, 0, 0]
              }),
              blocks5: createLayer(BlockLayer, {
                data: providers.blocks5,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[4] ? this.bdc.bars[4].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end5: createLayer(PlateEndLayer, {
                data: providers.ends5,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[4] ? this.bdc.bars[4].color : [0, 0, 0, 0]
              }),
              blocks6: createLayer(BlockLayer, {
                data: providers.blocks6,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[5] ? this.bdc.bars[5].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end6: createLayer(PlateEndLayer, {
                data: providers.ends6,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[5] ? this.bdc.bars[5].color : [0, 0, 0, 0]
              }),
              blocks7: createLayer(BlockLayer, {
                data: providers.blocks7,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[6] ? this.bdc.bars[6].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end7: createLayer(PlateEndLayer, {
                data: providers.ends7,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[6] ? this.bdc.bars[6].color : [0, 0, 0, 0]
              }),
              blocks8: createLayer(BlockLayer, {
                data: providers.blocks8,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[7] ? this.bdc.bars[7].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end8: createLayer(PlateEndLayer, {
                data: providers.ends8,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[7] ? this.bdc.bars[7].color : [0, 0, 0, 0]
              }),
              blocks9: createLayer(BlockLayer, {
                data: providers.blocks9,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[8] ? this.bdc.bars[8].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end9: createLayer(PlateEndLayer, {
                data: providers.ends9,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[8] ? this.bdc.bars[8].color : [0, 0, 0, 0]
              }),
              blocks10: createLayer(BlockLayer, {
                data: providers.blocks10,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragX: () => this.dragX,
                dragZ: () => this.dragZ,
                scaleX: () => this.scaleX,
                color: () =>
                  this.bdc.bars[9] ? this.bdc.bars[9].color : [0, 0, 0, 0],
                startTime: () => this.startTime,
                unitWidth: () => this.unitWidth
              }),
              end10: createLayer(PlateEndLayer, {
                data: providers.ends10,
                bottomCenter: () => this.bottomCenter,
                lightDirection: () => this.lightDirection,
                dragZ: () => this.dragZ,
                color: () =>
                  this.bdc.bars[9] ? this.bdc.bars[9].color : [0, 0, 0, 0]
              })
            }
          }
        }
      })
    });
  }
}
