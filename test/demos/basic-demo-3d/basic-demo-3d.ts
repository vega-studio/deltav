import { PerlinNoise } from "@diniden/signal-processing";
import * as datGUI from "dat.gui";
import {
  BasicSurface,
  Camera,
  Camera2D,
  ClearFlags,
  color4FromHex3,
  commands,
  createLayer,
  createTexture,
  createView,
  FragmentOutputType,
  InstanceProvider,
  nextFrame,
  onAnimationLoop,
  onFrame,
  PickType,
  TextureSize,
  View3D
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";
import { DEFAULT_RESOURCES } from "../../types";
import { SurfaceTileInstance } from "./surface-tile/surface-tile-instance";
import { SurfaceTileLayer } from "./surface-tile/surface-tile-layer";

const DATA_SIZE = 256;
const HEIGHT = 200;

enum ColorMode {
  PERLIN,
  HUE
}

/**
 * A very basic demo proving the system is operating as expected
 */
export class BasicDemo3D extends BaseDemo {
  /** Surface providers */
  providers = {
    tiles: new InstanceProvider<SurfaceTileInstance>()
  };

  /** GUI properties */
  parameters = {
    colorMode: ColorMode.PERLIN,

    toggleColor: () => {
      if (this.parameters.colorMode === ColorMode.PERLIN) {
        this.parameters.colorMode = ColorMode.HUE;
      } else {
        this.parameters.colorMode = ColorMode.PERLIN;
      }

      this.spread(
        this.tiles[Math.floor(this.tiles.length / 2)][
          Math.floor(this.tiles[0].length / 2)
        ],
        tiles => {
          tiles.forEach(t => this.colorizeTile(t));
        }
      );
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
    const parameters = gui.addFolder("Parameters");
    parameters.add(this.parameters, "toggleColor");
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
          fov: (60 * Math.PI) / 180,
          far: 100000
        })
      },
      resources: {
        font: DEFAULT_RESOURCES.font,
        pick: createTexture({
          width: TextureSize.SCREEN_QUARTER,
          height: TextureSize.SCREEN_QUARTER
        })
      },
      eventManagers: _cameras => ({}),
      scenes: (resources, providers, cameras) => ({
        preRender: commands(surface => {
          surface.commands.decodePicking();
        }),
        main: {
          views: {
            perspective: createView(View3D, {
              camera: cameras.perspective,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            }),
            pick: createView(View3D, {
              screenScale: [4, 4],
              pixelRatio: 0.5,
              camera: cameras.perspective,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              output: {
                buffers: { [FragmentOutputType.PICKING]: resources.pick },
                depth: true
              }
            })
          },
          layers: {
            squares: createLayer(SurfaceTileLayer, {
              printShader: true,
              data: providers.tiles,
              picking: PickType.SINGLE,

              onMouseOver: info => {
                info.instances.forEach(i => {
                  i.color = [1, 1, 0, 1];
                });
              },

              onMouseOut: info => {
                info.instances.forEach(i => {
                  this.colorizeTile(i);
                });
              },

              onMouseDown: async info => {
                if (info.instances.length <= 0) return;
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

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    const midX = (DATA_SIZE / 2) * 10;
    const midZ = (DATA_SIZE / 2) * 10;

    // Move the camera around
    const loop = (t: number) => {
      if (!this.surface) return;

      // Spin in the middle of the data!
      this.surface.cameras.perspective.position = [
        Math.sin(t / 2000) * midX + midX,
        300,
        Math.cos(t / 2000) * midX - midZ
      ];

      // Look at the middle of the data
      this.surface.cameras.perspective.lookAt([midX, 0, -midZ], [0, 1, 0]);
    };

    // Set the camera initial orientation
    this.surface.cameras.perspective.lookAt([midX, 50, -midZ], [0, 1, 0]);
    // Make the initial perlin data
    await this.generatePerlinData();
    // Run the camera positioning once
    loop(0);
    // Generate all of the tiles for our perlin data size
    const tilesFlattened = await this.generateTiles();
    // Initialize the tiles to be positioned to the perlin map
    this.moveTilesToPerlin(tilesFlattened);
    // Begin animating the camera
    onAnimationLoop(loop);

    await nextFrame();
  }

  async generatePerlinData() {
    if (!this.perlin) {
      const perlin = new PerlinNoise({
        width: DATA_SIZE,
        height: DATA_SIZE,
        blendPasses: 5,
        octaves: [
          [16, 64],
          [128, 16],
          [128, 128],
          [256, 256],
          [512, 512]
        ],
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

  async generateTiles() {
    // Generate all of the tiles for our perlin data size
    const tilesFlattened = [];
    let i = 0;

    for (const row of this.perlin.data) {
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

      this.moveTilesToPerlin(this.tiles[i]);
      i++;
      if (i % 224 === 0) await nextFrame();
    }

    return tilesFlattened;
  }

  colorizeTile(tile: SurfaceTileInstance) {
    const [i, k, index] = this.tileToIndex.get(tile.uid) || [0, 0, 0];

    if (this.parameters.colorMode === ColorMode.PERLIN) {
      const data = this.perlinData;
      const c =
        (data[i][k] + data[i + 1][k] + data[i + 1][k + 1] + data[i][k + 1]) / 4;
      tile.color = [c, c, c, 1];
    } else {
      tile.color = color4FromHex3(0xffffff - index);
    }
  }

  moveTilesToPerlin(tiles: SurfaceTileInstance[]) {
    const data = this.perlinData;

    for (let j = 0, iMax = tiles.length; j < iMax; ++j) {
      const tile = tiles[j];
      const index = this.tileToIndex.get(tile.uid);
      if (!index) continue;
      const [i, k] = index;

      tile.c1 = [i * 10, Math.pow(data[i][k] * HEIGHT, 1.1), -k * 10];
      tile.c2 = [(i + 1) * 10, Math.pow(data[i + 1][k] * HEIGHT, 1.1), -k * 10];
      tile.c3 = [
        (i + 1) * 10,
        Math.pow(data[i + 1][k + 1] * HEIGHT, 1.1),
        -(k + 1) * 10
      ];
      tile.c4 = [i * 10, Math.pow(data[i][k + 1] * HEIGHT, 1.1), -(k + 1) * 10];
      this.colorizeTile(tile);
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
          const [x, y] = index;
          neighborRow = this.tiles[x];

          if (neighborRow) {
            neighbor = neighborRow[y - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y + 1];
            if (neighbor) gather.push(neighbor);
          }

          neighborRow = this.tiles[x - 1];

          if (neighborRow) {
            neighbor = neighborRow[y];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y + 1];
            if (neighbor) gather.push(neighbor);
          }

          neighborRow = this.tiles[x + 1];

          if (neighborRow) {
            neighbor = neighborRow[y];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y + 1];
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
