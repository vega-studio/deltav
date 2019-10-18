import { PerlinNoise } from "@diniden/signal-processing";
import * as datGUI from "dat.gui";
import {
  AnchorType,
  Axis2D,
  BasicSurface,
  Camera,
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
  nextFrame,
  onFrame,
  PickType,
  Projection3D,
  rayFromPoints,
  rayToLocation,
  Vec4,
  View3D
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";
import { DEFAULT_RESOURCES } from "../../types";
import { Line3DInstance } from "./line-3d/line-3d-instance";
import { Line3DLayer } from "./line-3d/line-3d-layer";
import { SurfaceTileInstance } from "./surface-tile/surface-tile-instance";
import { SurfaceTileLayer } from "./surface-tile/surface-tile-layer";

const DATA_SIZE = 256;

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

  /** GUI properties */
  parameters = {
    count: 1000,
    radius: 100,
    moveAtOnce: 10000,
    addAtOnce: 10000,

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

  buildConsole(_gui: datGUI.GUI): void {
    // const parameters = gui.addFolder("Parameters");
    // parameters.add(this.parameters, "addAtOnce", 0, 100000, 1);
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

    // Move the camera around
    let t = 0;
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

    await nextFrame();
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
}
