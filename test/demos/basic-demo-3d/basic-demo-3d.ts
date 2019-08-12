import { PerlinNoise } from "@diniden/signal-processing";
import * as datGUI from "dat.gui";
import {
  add3,
  AnchorType,
  Axis2D,
  BasicSurface,
  Camera2D,
  ClearFlags,
  color4FromHex3,
  createLayer,
  createLayer2Din3D,
  createView,
  EdgeInstance,
  EdgeLayer,
  EdgeScaleType,
  EdgeType,
  InstanceProvider,
  LabelInstance,
  onFrame,
  PickType,
  Projection3D,
  rayFromPoints,
  rayToLocation,
  rotation4x4,
  scale3,
  subtract3,
  transform4,
  Vec3,
  Vec4,
  View3D
} from "src";
import { Camera } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { DEFAULT_RESOURCES } from "../../types";
import { Line3DInstance } from "./line-3d/line-3d-instance";
import { Line3DLayer } from "./line-3d/line-3d-layer";
import { SurfaceTileInstance } from "./surface-tile/surface-tile-instance";
import { SurfaceTileLayer } from "./surface-tile/surface-tile-layer";

const DATA_SIZE = 256;
const TO_RADIANS = Math.PI / 180;

export enum CameraOrder {
  DIRECT,
  DVH,
  DHV,
  VHD,
  VDH,
  HVD,
  HDV
}

/**
 * A very basic demo proving the system is operating as expected
 */
export class BasicDemo3D extends BaseDemo {
  /** Surface providers */
  providers = {
    tiles: new InstanceProvider<SurfaceTileInstance>(),
    lines: new InstanceProvider<Line3DInstance>(),
    ticks: new InstanceProvider<EdgeInstance>(),
    labels: new InstanceProvider<LabelInstance>()
  };

  gui: dat.GUI;

  mouseDown: boolean = false;
  mouseX: number;
  mouseY: number;

  private center: Vec3 = [0, 0, 0];

  cameraDistance: number = 200;
  cameraAngleV: number = 45 * TO_RADIANS;
  cameraAngleH: number = 45 * TO_RADIANS;
  cameraOrder: CameraOrder = CameraOrder.DIRECT;

  timeouts = [];
  intervals: any[] = [];

  /** GUI properties */
  parameters = {
    count: 1000,
    radius: 100,
    moveAtOnce: 10000,
    addAtOnce: 10000,

    distance: this.cameraDistance,
    angleV: Math.round(this.cameraAngleV / TO_RADIANS),
    angleH: Math.round(this.cameraAngleH / TO_RADIANS),
    duration: 100,
    order: this.cameraOrder,
    random: () => {
      this.parameters.angleH = 1 + Math.round(179 * Math.random());
      this.parameters.angleV = Math.round(90 * Math.random());
      this.moveCamera(
        (this.parameters.distance = 2000 + Math.round(4000 * Math.random())),
        this.parameters.angleH * TO_RADIANS,
        this.parameters.angleV * TO_RADIANS,
        this.parameters.duration,
        this.cameraOrder
      );

      this.gui.updateDisplay();
    },
    soaring1: () => {
      if (!this.surface) return;
      const startPoint: Vec3 = [DATA_SIZE * 10, 300, -DATA_SIZE * 10];
      // 0: Move to start
      this.moveCameraFocusingOnCenter(startPoint, 1000, 100);

      // 1: Move straight to Destiny1
      const destiny1: Vec3 = [
        this.center[0] + 0.5 * (this.center[0] - startPoint[0]),
        startPoint[1],
        this.center[1] + 0.5 * (this.center[1] - startPoint[1])
      ];

      setTimeout(() => {
        this.moveCameraToPosition(destiny1, 3000, 100);
      }, 1000);

      // 2: Rotate camera
      setTimeout(() => {
        this.rotateCamera(180 * TO_RADIANS, 100, true, 3000);
      }, 4000);

      // 3: Move back to start
      setTimeout(() => {
        this.moveCameraToPosition(startPoint, 3000, 100);
      }, 7000);

      // 4: Rotate camera
      setTimeout(() => {
        this.rotateCamera(180 * TO_RADIANS, 100, false, 3000);
      }, 10000);
    },
    soaring2: () => {
      if (!this.surface) return;

      const durations = [1000, 1000, 10000, 1000, 10000];
      let timeout = 0;

      // Part0: Move to start point
      const startPoint: Vec3 = [DATA_SIZE / 2 * 10, 300, 0];
      this.moveCameraFocusingOnCenter(startPoint, durations[0], 100);
      timeout += durations[0];

      // Part1: Go straight
      const destiny1: Vec3 = [DATA_SIZE / 2 * 10, 300, -DATA_SIZE * 0.75 * 10];

      setTimeout(() => {
        this.moveCameraToPosition(destiny1, durations[1], 100);
      }, timeout);

      timeout += durations[1];

      // Part2: Rotate around
      const circleCenter1: Vec3 = [
        DATA_SIZE * 0.75 * 10,
        300,
        -DATA_SIZE * 0.75 * 10
      ];

      setTimeout(() => {
        this.rotateCameraAround(
          circleCenter1,
          270 * TO_RADIANS,
          100,
          true,
          durations[2]
        );
      }, timeout);

      timeout += durations[2];

      // Part3: Go staight
      const destiny2: Vec3 = [
        DATA_SIZE * 0.25 * 10,
        300,
        -DATA_SIZE * 0.5 * 10
      ];

      setTimeout(() => {
        this.moveCameraToPosition(destiny2, durations[3], 100);
      }, timeout);
      timeout += durations[3];

      // Part4: Rotate around
      const circleCenter2: Vec3 = [
        DATA_SIZE * 0.25 * 10,
        300,
        -DATA_SIZE * 0.25 * 10
      ];

      setTimeout(() => {
        this.rotateCameraAround(
          circleCenter2,
          270 * TO_RADIANS,
          100,
          false,
          durations[4]
        );
      }, timeout);
      timeout += durations[4];
    },

    reset: () => {
      this.cameraDistance = 3500;
      this.cameraAngleV = 45 * TO_RADIANS;
      this.cameraAngleH = 45 * TO_RADIANS;
      this.cameraOrder = CameraOrder.DIRECT;
      this.parameters.distance = this.cameraDistance;
      this.parameters.angleV = this.cameraAngleV;
      this.parameters.angleH = this.cameraAngleH;
      this.parameters.order = this.cameraOrder;

      if (this.surface) {
        this.surface.cameras.perspective.position = [
          this.center[0] +
            this.cameraDistance *
              Math.sin(this.cameraAngleV) *
              Math.cos(this.cameraAngleH),
          this.center[1] + this.cameraDistance * Math.cos(this.cameraAngleV),
          this.center[2] +
            this.cameraDistance *
              Math.sin(this.cameraAngleV) *
              Math.sin(this.cameraAngleH)
        ];
        this.surface.cameras.perspective.lookAt(this.center, [0, 1, 0]);
      }

      for (let i = 0, endi = this.intervals.length; i < endi; i++) {
        const timerId = this.intervals[i];
        clearInterval(timerId);
      }
      this.intervals = [];
    },

    previous: {
      count: 1000
    }
  };

  /** All tiles being rendered */
  tiles: SurfaceTileInstance[][] = [];
  tileCorners: { tile: SurfaceTileInstance; corner: number }[][][] = [];
  tileToIndex = new Map<number, [number, number, number]>();
  isSpreading: boolean = false;
  isFlattened: boolean = false;
  perlin: PerlinNoise;
  perlinData: number[][];

  buildConsole(gui: datGUI.GUI): void {
    this.gui = gui;
    // const parameters = gui.addFolder("Parameters");
    // parameters.add(this.parameters, "addAtOnce", 0, 100000, 1);

    const parameters = gui.addFolder("Parameters");
    parameters
      .add(this.parameters, "distance", 1, 6000, 1)
      .onFinishChange((value: number) => {
        this.moveCameraByDistance(value, this.parameters.duration);
      });
    parameters
      .add(this.parameters, "angleV", 0, 180, 1)
      .onFinishChange((value: number) => {
        this.moveCameraByAngleV(value * TO_RADIANS, this.parameters.duration);
      });
    parameters
      .add(this.parameters, "angleH", 0, 360, 1)
      .onFinishChange((value: number) => {
        this.moveCameraByAngleH(value * TO_RADIANS, this.parameters.duration);
      });
    parameters.add(this.parameters, "duration", 100, 2000, 100);
    parameters
      .add(this.parameters, "order", {
        DIRECT: 0,
        DVH: 1,
        DHV: 2,
        VHD: 3,
        VDH: 4,
        HVD: 5,
        HDV: 6
      })
      .onChange((value: string) => {
        switch (value) {
          case "0":
            this.cameraOrder = CameraOrder.DIRECT;
            break;
          case "1":
            this.cameraOrder = CameraOrder.DVH;
            break;
          case "2":
            this.cameraOrder = CameraOrder.DHV;
            break;
          case "3":
            this.cameraOrder = CameraOrder.VHD;
            break;
          case "4":
            this.cameraOrder = CameraOrder.VDH;
            break;
          case "5":
            this.cameraOrder = CameraOrder.HVD;
            break;
          case "6":
            this.cameraOrder = CameraOrder.HDV;
            break;
        }
      });
    parameters.add(this.parameters, "random");
    parameters.add(this.parameters, "soaring1");
    parameters.add(this.parameters, "soaring2");
    parameters.add(this.parameters, "reset");
  }

  destroy(): void {
    super.destroy();
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        xz: new Camera2D(),
        perspective: Camera.makePerspective({
          fov: 60 * Math.PI / 180,
          far: 100000
        })
      },
      resources: {
        font: DEFAULT_RESOURCES.font
      },
      eventManagers: _cameras => ({}),
      pipeline: (_resources, providers, cameras) => ({
        resources: [],
        scenes: {
          main: {
            views: {
              perspective: createView(View3D, {
                camera: cameras.perspective,
                clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
              })
            },
            layers: {
              squares: createLayer(SurfaceTileLayer, {
                data: providers.tiles,
                picking: PickType.SINGLE,
                onMouseDown: info => {
                  this.mouseDown = true;
                  this.mouseX = info.screen[0];
                  this.mouseY = info.screen[1];
                },
                onMouseUp: info => {
                  this.mouseDown = false;
                  this.mouseX = info.screen[0];
                  this.mouseY = info.screen[1];
                },
                onMouseUpOutside: () => {
                  this.mouseDown = false;
                },
                onMouseMove: info => {
                  if (this.mouseDown && this.surface) {
                    this.cameraAngleH += (info.screen[0] - this.mouseX) / 100;
                    this.cameraAngleV += -(info.screen[1] - this.mouseY) / 100;
                    if (this.cameraAngleV < 0.0001) this.cameraAngleV = 0.0001;
                    if (this.cameraAngleV > Math.PI) {
                      this.cameraAngleV = Math.PI;
                    }
                    this.setCamera();
                    this.mouseX = info.screen[0];
                    this.mouseY = info.screen[1];
                  }
                },
                onMouseOver: info => {
                  info.instances.forEach(i => {
                    i.color = [1, 1, 0, 1];
                  });
                },

                onMouseOut: info => {
                  info.instances.forEach(i => {
                    const index = this.tileToIndex.get(i.uid);
                    if (!index) return;
                    i.color = color4FromHex3(0xffffff - index[2]);
                  });
                },

                onMouseClick: async info => {
                  if (this.isSpreading || info.instances.length <= 0) return;
                  if (!this.isFlattened) {
                    this.isFlattened = true;
                    await this.spread(info.instances[0], tiles => {
                      for (let i = 0, iMax = tiles.length; i < iMax; ++i) {
                        const tile = tiles[i];
                        tile.c1[1] = 0;
                        tile.c2[1] = 0;
                        tile.c3[1] = 0;
                        tile.c4[1] = 0;
                        tile.c1 = tile.c1;
                        tile.c2 = tile.c2;
                        tile.c3 = tile.c3;
                        tile.c4 = tile.c4;
                      }
                    });
                  } else {
                    this.isFlattened = false;
                    // Make a new perlin noise map
                    await this.generatePerlinData();
                    // Move the tiles to their new perlin position
                    await this.spread(info.instances[0], tiles => {
                      this.moveTilesToPerlin(tiles);
                    });
                  }
                }
              })
            }
          },
          overlay: {
            views: {
              perspective: createView(View3D, {
                camera: cameras.perspective,
                clearFlags: [ClearFlags.DEPTH]
              })
            },
            layers: {
              ticks: createLayer2Din3D(Axis2D.XZ, EdgeLayer, {
                data: providers.ticks,
                type: EdgeType.LINE,
                control2D: cameras.xz.control2D,
                scaleType: EdgeScaleType.NONE
              }),
              lines: createLayer(Line3DLayer, {
                data: providers.lines,
                // Toggle this to SINGLE to draw rays that eminate from the camera
                picking: PickType.NONE,

                onMouseClick: info => {
                  if (!(info.projection instanceof Projection3D)) return;
                  const ray = rayFromPoints(
                    cameras.perspective.position,
                    info.projection.screenToWorld(info.screen)
                  );
                  this.providers.lines.add(
                    new Line3DInstance({
                      start: rayToLocation(ray, -10),
                      end: rayToLocation(ray, 300),
                      colorEnd: [0, 1, 0, 1],
                      colorStart: [1, 0, 0, 1]
                    })
                  );
                }
              })
              // TODO: Labels don't render quite as expected. The Desire is to render the anchor with the 3D world in mind
              // after projecting that to the screen we'd want the labels to render relativeto that 2D projected point.
              // labels: createLayer2Din3D(Axis2D.XZ, LabelLayer, {
              //   data: providers.labels,
              //   resourceKey: resources.font.key,
              //   control2D: cameras.xz.control2D,
              //   scaleMode: ScaleMode.NEVER
              // })
            }
          }
        }
      })
    });
  }

  addToCorner(
    r: number,
    col: number,
    corner: number,
    tile: SurfaceTileInstance
  ) {
    const row = this.tileCorners[r] || [];
    this.tileCorners[r] = row;
    const bucket = row[col] || [];
    row[col] = bucket;
    bucket.push({ tile, corner });
  }

  makeAxis(showXYZ?: boolean) {
    const tickColor: Vec4 = [1, 1, 1, 1];
    const tickLength = DATA_SIZE / 128 * 25;

    for (let i = 0; i < DATA_SIZE / 10; ++i) {
      this.providers.ticks.add(
        new EdgeInstance({
          start: [i * 10 * 10, 0],
          end: [i * 10 * 10, tickLength],
          startColor: tickColor,
          endColor: tickColor,
          thickness: [10, 10],
          depth: 0
        })
      );

      this.providers.labels.add(
        new LabelInstance({
          text: `${i}`,
          anchor: {
            type: AnchorType.MiddleRight,
            padding: 0
          },
          color: tickColor,
          origin: [i * 10 * 10, tickLength],
          fontSize: 100
        })
      );
    }

    for (let i = 0; i < DATA_SIZE / 10; ++i) {
      this.providers.ticks.add(
        new EdgeInstance({
          start: [0, -i * 10 * 10],
          end: [-tickLength, -i * 10 * 10],
          startColor: tickColor,
          endColor: tickColor,
          thickness: [10, 10],
          depth: 0
        })
      );

      this.providers.labels.add(
        new LabelInstance({
          text: `${i}`,
          anchor: {
            type: AnchorType.MiddleLeft,
            padding: 0
          },
          color: tickColor,
          origin: [-tickLength, -i * 10 * 10],
          fontSize: 100
        })
      );
    }

    if (showXYZ) {
      this.providers.lines.add(
        new Line3DInstance({
          start: [0, 0, 0],
          end: [0, 1000, 0],
          colorStart: [0, 1, 0, 1],
          colorEnd: [0, 1, 0, 1]
        })
      );

      this.providers.lines.add(
        new Line3DInstance({
          start: [0, 0, 0],
          end: [1000, 0, 0],
          colorStart: [1, 0, 0, 1],
          colorEnd: [1, 0, 0, 1]
        })
      );

      this.providers.lines.add(
        new Line3DInstance({
          start: [0, 0, 0],
          end: [0, 0, 1000],
          colorStart: [0, 0, 1, 1],
          colorEnd: [0, 0, 1, 1]
        })
      );
    }
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    const midX = DATA_SIZE / 2 * 10;
    const midZ = DATA_SIZE / 2 * 10;

    // Set the camera initial orientation
    this.surface.cameras.perspective.lookAt([midX, 50, -midZ], [0, 1, 0]);
    // Make the initial perlin data
    await this.generatePerlinData();
    // Generate all of the tiles for our perlin data size
    const tilesFlattened = [];

    for (let i = 0, iMax = this.perlin.data.length; i < iMax; ++i) {
      const row = this.perlin.data[i];
      this.tiles.push([]);

      for (let k = 0, kMax = row.length; k < kMax; ++k) {
        const tile = this.providers.tiles.add(
          new SurfaceTileInstance({
            corners: [
              [i * 10, 0, -k * 10],
              [(i + 1) * 10, 0, -k * 10],
              [(i + 1) * 10, 0, -(k + 1) * 10],
              [i * 10, 0, -(k + 1) * 10]
            ],
            color: color4FromHex3(0xffffff - tilesFlattened.length)
          })
        );

        this.addToCorner(i, k, 1, tile);
        this.addToCorner(i + 1, k, 2, tile);

        this.tiles[i][k] = tile;
        this.tileToIndex.set(tile.uid, [i, k, tilesFlattened.length]);
        tilesFlattened.push(tile);
      }
    }

    // Initialize the tiles to be positioned to the perlin map
    this.moveTilesToPerlin(tilesFlattened);
    // Draw the axis
    this.makeAxis();

    this.center = [midX, 0, -midZ];
    this.cameraDistance = Math.sqrt(midX ** 2 + 3000 ** 2 + midZ ** 2);
    this.parameters.distance = this.cameraDistance;
    this.gui.updateDisplay();
    this.setCamera();

    // this.surface.cameras.perspective.position = [midX * 2, 3000, -midZ * 2];
    // this.surface.cameras.perspective.lookAt([midX, 0, -midZ], [0, 1, 0]);

    // Move the camera around
    /*let t = 0;
    const loop = () => {
      if (!this.surface) return;
      t += Math.PI / 120;

      // Spin in the middle of the data!
      this.surface.cameras.perspective.position = [
        Math.sin(t / 5) * midX + midX,
        300,
        Math.cos(t / 5) * midX - midZ
      ];

      // Good view from afar
      // this.surface.cameras.perspective.position = [midX * 2, 3000, -midZ * 2];

      // View from afar opposite
      this.surface.cameras.perspective.position = [-midX * 2, 3000, midZ * 2];

      // Observe the origin from above
      // this.surface.cameras.perspective.position = [0, 1000, 0];
      // this.surface.cameras.perspective.lookAt([0, 0, 0], [0, 0, -1]);

      // Observe the origin XY
      // this.surface.cameras.perspective.position = [0, 0, 100];
      // this.surface.cameras.perspective.lookAt([0, 0, 0], [0, 1, 0]);

      // Look at the middle of the data
      this.surface.cameras.perspective.lookAt([midX, 0, -midZ], [0, 1, 0]);

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);

    await nextFrame();*/
  }

  async generatePerlinData() {
    if (!this.perlin) {
      const perlin = new PerlinNoise({
        width: DATA_SIZE,
        height: DATA_SIZE,
        blendPasses: 5,
        octaves: [[16, 64], [128, 16], [128, 128], [256, 256], [512, 512]],
        valueRange: [0, 1]
      });

      this.perlin = perlin;
    }

    await this.perlin.generate();

    // Add an extra row and column to make over sampling not break the loop
    let data = this.perlin.sample(0, 0, DATA_SIZE, DATA_SIZE);
    data.push(data[data.length - 1].slice(0));
    data = data.map(r => {
      const row = r.slice(0);
      row.push(r[r.length - 1]);
      return row;
    });

    this.perlinData = data;
  }

  moveTilesToPerlin(tiles: SurfaceTileInstance[]) {
    const data = this.perlinData;

    for (let j = 0, iMax = tiles.length; j < iMax; ++j) {
      const tile = tiles[j];
      const index = this.tileToIndex.get(tile.uid);
      if (!index) continue;
      const [i, k] = index;

      tile.c1 = [i * 10, Math.pow(data[i][k] * 200, 1.1), -k * 10];
      tile.c2 = [(i + 1) * 10, Math.pow(data[i + 1][k] * 200, 1.1), -k * 10];
      tile.c3 = [
        (i + 1) * 10,
        Math.pow(data[i + 1][k + 1] * 200, 1.1),
        -(k + 1) * 10
      ];
      tile.c4 = [i * 10, Math.pow(data[i][k + 1] * 200, 1.1), -(k + 1) * 10];
    }
  }

  async spread(
    target: SurfaceTileInstance,
    cb: (tiles: SurfaceTileInstance[]) => void
  ) {
    if (this.isSpreading) return;
    this.isSpreading = true;

    let neighbor: SurfaceTileInstance | undefined;
    let neighborRow: SurfaceTileInstance[] | undefined;
    let nextRing = [target];
    const processed = new Set<number>();
    cb(nextRing);
    processed.add(target.uid);
    await onFrame();

    while (nextRing.length > 0) {
      const gather = [];

      for (let i = 0, iMax = nextRing.length; i < iMax; ++i) {
        const tile = nextRing[i];
        const index = this.tileToIndex.get(tile.uid);

        if (index) {
          neighborRow = this.tiles[index[0]];

          if (neighborRow) {
            neighbor = neighborRow[index[1] - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[index[1] + 1];
            if (neighbor) gather.push(neighbor);
          }

          neighborRow = this.tiles[index[0] - 1];

          if (neighborRow) {
            neighbor = neighborRow[index[1]];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[index[1] - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[index[1] + 1];
            if (neighbor) gather.push(neighbor);
          }

          neighborRow = this.tiles[index[0] + 1];

          if (neighborRow) {
            neighbor = neighborRow[index[1]];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[index[1] - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[index[1] + 1];
            if (neighbor) gather.push(neighbor);
          }
        }
      }

      nextRing = gather.filter(tile => {
        if (!processed.has(tile.uid)) {
          processed.add(tile.uid);
          return true;
        }

        return false;
      });

      cb(nextRing);
      await onFrame();
    }

    this.isSpreading = false;
  }

  setCamera() {
    if (!this.surface) return;
    this.surface.cameras.perspective.position = [
      this.center[0] +
        this.cameraDistance *
          Math.sin(this.cameraAngleV) *
          Math.cos(this.cameraAngleH),
      this.center[1] + this.cameraDistance * Math.cos(this.cameraAngleV),
      this.center[2] +
        this.cameraDistance *
          Math.sin(this.cameraAngleV) *
          Math.sin(this.cameraAngleH)
    ];

    this.surface.cameras.perspective.lookAt(this.center, [0, 1, 0]);
  }

  moveCameraByDistance(distance: number, duration: number) {
    const newPosition: Vec3 = [
      this.center[0] +
        distance * Math.sin(this.cameraAngleV) * Math.cos(this.cameraAngleH),
      this.center[1] + distance * Math.cos(this.cameraAngleV),
      this.center[2] +
        distance * Math.sin(this.cameraAngleV) * Math.sin(this.cameraAngleH)
    ];

    this.moveCameraFocusingOnCenter(newPosition, duration, 100);
    this.cameraDistance = distance;
  }

  moveCameraByAngleH(angleH: number, duration: number) {
    const newPosition: Vec3 = [
      this.center[0] +
        this.cameraDistance * Math.sin(this.cameraAngleV) * Math.cos(angleH),
      this.center[1] + this.cameraDistance * Math.cos(this.cameraAngleV),
      this.center[2] +
        this.cameraDistance * Math.sin(this.cameraAngleV) * Math.sin(angleH)
    ];

    this.moveCameraFocusingOnCenter(newPosition, duration, 100);
    this.cameraAngleH = angleH;
  }

  moveCameraByAngleV(angleV: number, duration: number) {
    const newPosition: Vec3 = [
      this.center[0] +
        this.cameraDistance * Math.sin(angleV) * Math.cos(this.cameraAngleH),
      this.center[1] + this.cameraDistance * Math.cos(angleV),
      this.center[2] +
        this.cameraDistance * Math.sin(angleV) * Math.sin(this.cameraAngleH)
    ];

    this.moveCameraFocusingOnCenter(newPosition, duration, 100);
    this.cameraAngleV = angleV;
  }

  moveCameraDirect(
    distance: number,
    angleH: number,
    angleV: number,
    duration: number
  ) {
    const newPosition: Vec3 = [
      this.center[0] + distance * Math.sin(angleV) * Math.cos(angleH),
      this.center[1] + distance * Math.cos(angleV),
      this.center[2] + distance * Math.sin(angleV) * Math.sin(angleH)
    ];

    this.moveCameraFocusingOnCenter(newPosition, duration, 100);

    this.cameraDistance = distance;
    this.cameraAngleH = angleH;
    this.cameraAngleV = angleV;
  }

  moveCameraFocusingOnCenter(
    newPosition: Vec3,
    duration: number,
    steps: number
  ) {
    if (!this.surface) return;
    const oldPosition = this.surface.cameras.perspective.position;

    let i = 0;

    const timerId = setInterval(() => {
      if (this.surface) {
        const curPos: Vec3 = add3(
          oldPosition,
          scale3(subtract3(newPosition, oldPosition), i / steps)
        );

        this.surface.cameras.perspective.position = curPos;
        this.surface.cameras.perspective.lookAt(this.center, [0, 1, 0]);
        i++;
        if (i === steps) clearInterval(timerId);
      }
    }, duration / steps);

    this.intervals.push(timerId);
  }

  moveCameraToPosition(newPosition: Vec3, duration: number, steps: number) {
    if (!this.surface) return;
    const oldPosition = this.surface.cameras.perspective.position;
    const focus = this.surface.cameras.perspective.transform.focus;
    const offset = subtract3(focus, oldPosition);

    let i = 0;

    const timerId = setInterval(() => {
      if (this.surface) {
        const curPos: Vec3 = add3(
          oldPosition,
          scale3(subtract3(newPosition, oldPosition), i / steps)
        );

        const curFocus = offset ? add3(curPos, offset) : this.center;
        this.surface.cameras.perspective.position = curPos;
        this.surface.cameras.perspective.lookAt(curFocus, [0, 1, 0]);
        i++;
        if (i === steps) clearInterval(timerId);
      }
    }, duration / steps);

    this.intervals.push(timerId);
  }

  rotateCameraAround(
    center: Vec3,
    angles: number,
    steps: number,
    clockWise: boolean,
    duration: number
  ) {
    if (!this.surface) return;
    const startPosition = this.surface.cameras.perspective.position;
    const focus = this.surface.cameras.perspective.transform.focus;
    const offset = subtract3(focus, startPosition);
    const relativePostion = subtract3(startPosition, center);
    const radius = Math.sqrt(relativePostion[0] ** 2 + relativePostion[2] ** 2);

    let startAngle = Math.asin(relativePostion[2] / radius);
    if (relativePostion[0] < 0) startAngle = Math.PI - startAngle;

    const stepAngle = (clockWise ? 1 : -1) * angles / steps;

    let curAngle = startAngle;
    let count = 0;
    const timerId = setInterval(() => {
      if (this.surface) {
        count++;
        curAngle += stepAngle;

        const curPos = add3(center, [
          radius * Math.cos(curAngle),
          0,
          radius * Math.sin(curAngle)
        ]);

        const curOffset = transform4(rotation4x4(0, -count * stepAngle, 0), [
          offset[0],
          offset[1],
          offset[2],
          1
        ]);

        const curFocus = add3(curPos, [
          curOffset[0],
          curOffset[1],
          curOffset[2]
        ]);

        this.surface.cameras.perspective.position = curPos;
        this.surface.cameras.perspective.lookAt(curFocus, [0, 1, 0]);
      }

      if (count >= steps) clearInterval(timerId);
    }, duration / steps);

    this.intervals.push(timerId);
  }

  rotateCamera(
    angles: number,
    steps: number,
    clockWise: Boolean,
    duration: number
  ) {
    if (!this.surface) return;
    const position = this.surface.cameras.perspective.position;
    const focus = this.surface.cameras.perspective.transform.focus;
    const offset = subtract3(focus, position);
    const offsetRadius = Math.sqrt(offset[0] ** 2 + offset[2] ** 2);

    const stepAngle = (clockWise ? 1 : -1) * angles / steps;

    let angle = Math.asin(offset[2] / offsetRadius);
    if (offset[0] < 0) angle = Math.PI - angle;

    let count = 0;
    const timerId = setInterval(() => {
      if (this.surface) {
        count++;
        const curAngle = angle + count * stepAngle;

        const curFocus = add3(position, [
          offsetRadius * Math.cos(curAngle),
          offset[1],
          offsetRadius * Math.sin(curAngle)
        ]);

        this.surface.cameras.perspective.lookAt(curFocus, [0, 1, 0]);
        if (count >= steps) clearInterval(timerId);
      }
    }, duration / steps);

    this.intervals.push(timerId);
  }

  moveCamera(
    distance: number,
    angleH: number,
    angleV: number,
    duration: number,
    order?: CameraOrder
  ) {
    order = order || CameraOrder.DIRECT;

    const subDuration = duration / 3;

    switch (order) {
      case CameraOrder.DIRECT:
        this.moveCameraDirect(distance, angleH, angleV, duration);
        break;
      case CameraOrder.DVH:
        this.moveCameraByDistance(distance, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleV(angleV, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleH(angleH, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.DHV:
        this.moveCameraByDistance(distance, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleH(angleH, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleV(angleV, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.HDV:
        this.moveCameraByAngleH(angleH, subDuration);
        setTimeout(() => {
          this.moveCameraByDistance(distance, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleV(angleV, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.HVD:
        this.moveCameraByAngleH(angleH, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleV(angleV, subDuration);
          setTimeout(() => {
            this.moveCameraByDistance(distance, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.VDH:
        this.moveCameraByAngleV(angleV, subDuration);
        setTimeout(() => {
          this.moveCameraByDistance(distance, subDuration);
          setTimeout(() => {
            this.moveCameraByAngleH(angleH, subDuration);
          }, subDuration);
        }, subDuration);
        break;
      case CameraOrder.VHD:
        this.moveCameraByAngleV(angleV, subDuration);
        setTimeout(() => {
          this.moveCameraByAngleH(angleH, subDuration);
          setTimeout(() => {
            this.moveCameraByDistance(distance, subDuration);
          }, subDuration);
        }, subDuration);
        break;
    }
  }
}
