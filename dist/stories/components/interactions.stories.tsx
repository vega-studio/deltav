import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../util/hooks/use-life-cycle.js";
import {
  AutoEasingMethod,
  BasicCamera2DControllerJSX,
  Camera,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  color4FromHex3,
  CommandsJSX,
  DrawJSX,
  FragmentOutputType,
  GLSettings,
  IMouseInteraction,
  InstanceProvider,
  LayerJSX,
  nextFrame,
  onFrame,
  PickType,
  PromiseResolver,
  SceneJSX,
  SimpleEventHandlerJSX,
  Surface,
  SurfaceJSX,
  TextureJSX,
  TextureSize,
  type Vec3,
  View2D,
  View3D,
  ViewJSX,
} from "../../src";
import { SurfaceTileInstance } from "./layers/surface-tile/surface-tile-instance.js";
import { SurfaceTileLayer } from "./layers/surface-tile/surface-tile-layer.js";
import { PerlinNoise } from "./signal-processing/index.js";

export default {
  title: "Deltav/Interactions",
  args: {},
  argTypes: {},
};

export const Simple_Event_Handler: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 100; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [
                Math.random() * 400 - 200 + size.mid[0],
                Math.random() * 400 - 200 + size.mid[1],
              ],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
      }

      return () => {};
    },
  });

  const handleMouseDown = (e: IMouseInteraction) => {
    if (!circles.current) return;
    const world = e.target.view.projection.screenToWorld(e.screen.position);

    circles.current.forEach((circle) => {
      circle.center = [
        Math.random() * 400 - 200 + world[0],
        Math.random() * 400 - 200 + world[1],
      ];
    });
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <BasicCamera2DControllerJSX config={{ camera: camera.current }} />
      <SimpleEventHandlerJSX handlers={{ handleMouseDown }} />
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: [0, 0, 0, 1],
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        type={CircleLayer}
        providerRef={circleProvider}
        config={{
          animate: {
            center: AutoEasingMethod.easeInOutCubic(2000),
          },
        }}
      />
    </SurfaceJSX>
  );
}).bind({});

export const Color_Picking: StoryFn = (() => {
  const circleProvider = React.useRef<InstanceProvider<CircleInstance>>(null);
  const circles = React.useRef<CircleInstance[]>([]);
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      if (!circleProvider.current) return;

      const size = surface.getViewSize("render.main");
      if (!size) {
        console.warn("Invalid View Size", surface);
        return;
      }

      const instances: CircleInstance[] = [];

      for (let i = 0, iMax = 10000; i < iMax; ++i) {
        instances.push(
          circleProvider.current.add(
            new CircleInstance({
              center: [Math.random() * size.width, Math.random() * size.height],
              radius: Math.random() * 5 + 2,
              color: [
                0,
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.8 + 0.2,
                1,
              ],
            })
          )
        );

        circles.current = instances;
      }

      return () => {};
    },
  });

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <BasicCamera2DControllerJSX
        config={{
          camera: camera.current,
          startView: "render.main",
          ignoreCoverViews: true,
        }}
      />
      {CommandsJSX({
        name: "decode-picking",
        callback: (surface) => {
          surface.commands.decodePicking();
        },
      })}
      <TextureJSX
        name="pick"
        width={TextureSize.SCREEN_QUARTER}
        height={TextureSize.SCREEN_QUARTER}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <SceneJSX name="render">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: camera.current,
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
        />
        <ViewJSX
          name="pick-view"
          type={View2D}
          config={{
            screenScale: [4, 4],
            pixelRatio: 0.5,
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: { [FragmentOutputType.PICKING]: "pick" },
            depth: true,
          }}
        />
        <LayerJSX
          type={CircleLayer}
          providerRef={circleProvider}
          config={{
            picking: PickType.SINGLE,
            animate: {
              center: AutoEasingMethod.easeInOutCubic(2000),
              radius: AutoEasingMethod.easeOutCubic(200),
            },
            onMouseOver: (info) => {
              info.instances.forEach((i) => (i.radius = 50));
            },

            onMouseOut: (info) => {
              info.instances.forEach((i) => (i.radius = 5));
            },
          }}
        />
      </SceneJSX>
      {DrawJSX({
        name: "render-pick",
        input: "pick",
        view: {
          config: {
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            viewport: { right: 10, bottom: 10, width: "30%", height: "30%" },
          },
        },
      })}
    </SurfaceJSX>
  );
}).bind({});

export const Complex_Color_Picking_Scene: StoryFn = () => {
  const DATA_SIZE = 256;
  const HEIGHT = 200;

  enum ColorMode {
    PERLIN,
    HUE,
  }

  const camera = React.useRef(
    Camera.makePerspective({
      fov: (60 * Math.PI) / 180,
      far: 100000,
    })
  );
  const ready = React.useRef(new PromiseResolver<Surface>());
  const tileProvider = React.useRef(
    new InstanceProvider<SurfaceTileInstance>()
  );

  const state = React.useRef({
    isFlattened: true,
    isSpreading: false,
    tileToIndex: new Map<number, Vec3>(),
    perlin: new PerlinNoise({
      width: DATA_SIZE,
      height: DATA_SIZE,
      blendPasses: 5,
      octaves: [
        [16, 64],
        [128, 16],
        [128, 128],
        [256, 256],
        [512, 512],
      ],
      valueRange: [0, 1],
    }),
    perlinData: [] as number[][],
    tiles: [] as SurfaceTileInstance[][],
    tileCorners: [] as { tile: SurfaceTileInstance; corner: number }[][][],
    parameters: {
      colorMode: ColorMode.HUE,
    },
  }).current;

  const generatePerlinData = async () => {
    if (!state.perlin) {
      const perlin = new PerlinNoise({
        width: DATA_SIZE,
        height: DATA_SIZE,
        blendPasses: 5,
        octaves: [
          [16, 64],
          [128, 16],
          [128, 128],
          [256, 256],
          [512, 512],
        ],
        valueRange: [0, 1],
      });

      state.perlin = perlin;
    }

    await state.perlin.generate();

    // Add an extra row and column to make over sampling not break the loop
    let data = state.perlin.sample(0, 0, DATA_SIZE, DATA_SIZE);
    data.push(data[data.length - 1].slice(0));
    data = data.map((r) => {
      const row = r.slice(0);
      row.push(r[r.length - 1]);
      return row;
    });

    state.perlinData = data;
  };

  const addToCorner = (
    r: number,
    col: number,
    corner: number,
    tile: SurfaceTileInstance
  ) => {
    const row = state.tileCorners[r] || [];
    state.tileCorners[r] = row;
    const bucket = row[col] || [];
    row[col] = bucket;
    bucket.push({ tile, corner });
  };

  const generateTiles = async () => {
    // Generate all of the tiles for our perlin data size
    const tilesFlattened = [];
    let i = 0;

    for (const row of state.perlin.data) {
      state.tiles.push([]);

      for (let k = 0, kMax = row.length; k < kMax; ++k) {
        const tile = tileProvider.current.add(
          new SurfaceTileInstance({
            corners: [
              [i * 10, 0, -k * 10],
              [(i + 1) * 10, 0, -k * 10],
              [(i + 1) * 10, 0, -(k + 1) * 10],
              [i * 10, 0, -(k + 1) * 10],
            ],
            color: color4FromHex3(0xffffff - tilesFlattened.length),
          })
        );

        addToCorner(i, k, 1, tile);
        addToCorner(i + 1, k, 2, tile);

        state.tiles[i][k] = tile;
        state.tileToIndex.set(tile.uid, [i, k, tilesFlattened.length]);
        tilesFlattened.push(tile);
      }

      moveTilesToPerlin(state.tiles[i]);
      i++;
      if (i % 224 === 0) await nextFrame();
    }

    return tilesFlattened;
  };

  const colorizeTile = (tile: SurfaceTileInstance) => {
    const [i, k, index] = state.tileToIndex.get(tile.uid) || [0, 0, 0];

    if (state.parameters.colorMode === ColorMode.PERLIN) {
      const data = state.perlinData;
      const c =
        (data[i][k] + data[i + 1][k] + data[i + 1][k + 1] + data[i][k + 1]) / 4;
      tile.color = [c, c, c, 1];
    } else {
      tile.color = color4FromHex3(0xffffff - index);
    }
  };

  const moveTilesToPerlin = (tiles: SurfaceTileInstance[]) => {
    const data = state.perlinData;

    for (let j = 0, iMax = tiles.length; j < iMax; ++j) {
      const tile = tiles[j];
      const index = state.tileToIndex.get(tile.uid);
      if (!index) continue;
      const [i, k] = index;

      tile.c1 = [i * 10, Math.pow(data[i][k] * HEIGHT, 1.1), -k * 10];
      tile.c2 = [(i + 1) * 10, Math.pow(data[i + 1][k] * HEIGHT, 1.1), -k * 10];
      tile.c3 = [
        (i + 1) * 10,
        Math.pow(data[i + 1][k + 1] * HEIGHT, 1.1),
        -(k + 1) * 10,
      ];
      tile.c4 = [i * 10, Math.pow(data[i][k + 1] * HEIGHT, 1.1), -(k + 1) * 10];
      colorizeTile(tile);
    }
  };

  const spread = async (
    target: SurfaceTileInstance,
    cb: (tiles: SurfaceTileInstance[]) => void
  ) => {
    if (state.isSpreading) return;
    state.isSpreading = true;

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
        const index = state.tileToIndex.get(tile.uid);

        if (index) {
          const [x, y] = index;
          neighborRow = state.tiles[x];

          if (neighborRow) {
            neighbor = neighborRow[y - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y + 1];
            if (neighbor) gather.push(neighbor);
          }

          neighborRow = state.tiles[x - 1];

          if (neighborRow) {
            neighbor = neighborRow[y];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y - 1];
            if (neighbor) gather.push(neighbor);
            neighbor = neighborRow[y + 1];
            if (neighbor) gather.push(neighbor);
          }

          neighborRow = state.tiles[x + 1];

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

      nextRing = gather.filter((tile) => {
        if (!processed.has(tile.uid)) {
          processed.add(tile.uid);
          return true;
        }

        return false;
      });

      cb(nextRing);
      await onFrame();
    }

    state.isSpreading = false;
  };

  useLifecycle({
    async didMount() {
      const surface = await ready.current.promise;

      const midX = (DATA_SIZE / 2) * 10;
      const midZ = (DATA_SIZE / 2) * 10;

      // Move the camera around
      const loop = (t: number) => {
        if (!surface) return;

        // Spin in the middle of the data!
        camera.current.position = [
          Math.sin(t / 2000) * midX + midX,
          300,
          Math.cos(t / 2000) * midX - midZ,
        ];

        // Look at the middle of the data
        camera.current.lookAt([midX, 0, -midZ], [0, 1, 0]);
      };

      // Set the camera initial orientation
      camera.current.lookAt([midX, 50, -midZ], [0, 1, 0]);
      // Make the initial perlin data
      await generatePerlinData();
      // Run the camera positioning once
      loop(0);
      // Generate all of the tiles for our perlin data size
      const tilesFlattened = await generateTiles();
      // Initialize the tiles to be positioned to the perlin map
      moveTilesToPerlin(tilesFlattened);
      // Begin animating the camera
      // onAnimationLoop(loop);

      await nextFrame();
    },
  });

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <TextureJSX
        name="pick"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      {CommandsJSX({
        name: "decode-picking",
        callback: (surface) => {
          surface.commands.decodePicking();
        },
      })}
      <ViewJSX
        name="main"
        type={View3D}
        config={{
          background: [0, 0, 0.2, 1],
          camera: camera.current,
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <ViewJSX
        name="pick-view"
        type={View3D}
        config={{
          // screenScale: [4, 4],
          // pixelRatio: 0.5,
          camera: camera.current,
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
        output={{
          buffers: { [FragmentOutputType.PICKING]: "pick" },
          depth: true,
        }}
      />
      <LayerJSX
        type={SurfaceTileLayer}
        providerRef={tileProvider}
        config={{
          picking: PickType.SINGLE,
          onMouseOver: (info) => {
            info.instances.forEach((i) => {
              i.color = [1, 1, 0, 1];
            });
          },

          onMouseOut: (info) => {
            info.instances.forEach((_i) => {
              // colorizeTile(i);
            });
          },

          onMouseDown: async (info) => {
            if (info.instances.length <= 0) return;
            if (state.isSpreading || info.instances.length <= 0) return;
            if (!state.isFlattened) {
              state.isFlattened = true;

              await spread(info.instances[0], (tiles) => {
                for (let i = 0, iMax = tiles.length; i < iMax; ++i) {
                  const tile = tiles[i];
                  tile.c1[1] = 0;
                  tile.c2[1] = 0;
                  tile.c3[1] = 0;
                  tile.c4[1] = 0;
                  // eslint-disable-next-line no-self-assign
                  tile.c1 = tile.c1;
                  // eslint-disable-next-line no-self-assign
                  tile.c2 = tile.c2;
                  // eslint-disable-next-line no-self-assign
                  tile.c3 = tile.c3;
                  // eslint-disable-next-line no-self-assign
                  tile.c4 = tile.c4;
                }
              });
            } else {
              state.isFlattened = false;
              // Make a new perlin noise map
              await generatePerlinData();
              // Move the tiles to their new perlin position
              await spread(info.instances[0], (tiles) => {
                moveTilesToPerlin(tiles);
              });
            }
          },
        }}
      />
      {DrawJSX({
        name: "render-pick",
        input: "pick",
        view: {
          config: {
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            viewport: { right: 10, bottom: 10, width: "30%", height: "30%" },
          },
        },
      })}
    </SurfaceJSX>
  );
};
