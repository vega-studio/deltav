import { PerlinNoise } from "@diniden/signal-processing";
import * as datGUI from "dat.gui";
import {
  BasicSurface,
  Camera2D,
  CircleInstance,
  ClearFlags,
  color4FromHex3,
  createLayer,
  createView,
  InstanceProvider,
  PickType,
  Size,
  Vec2Compat,
  View3D
} from "src";
import { CubeInstance } from "../../../src/3d/layers/cube/cube-instance";
import { CubeLayer } from "../../../src/3d/layers/cube/cube-layer";
import { TriangleInstance } from "../../../src/3d/layers/triangle/triangle-instance";
import { TriangleLayer } from "../../../src/3d/layers/triangle/triangle-layer";
import { Camera } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { SurfaceTileInstance } from "./surface-tile/surface-tile-instance";
import { SurfaceTileLayer } from "./surface-tile/surface-tile-layer";

/**
 * A very basic demo proving the system is operating as expected
 */
export class BasicDemo3D extends BaseDemo {
  /** All circles created for this demo */
  circles: CircleInstance[] = [];
  /** Stores the size of the screen */
  screen: Size;
  /** Timer used to debounce the shake circle operation */
  shakeTimer: number;

  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>(),
    circles: new InstanceProvider<CircleInstance>(),
    triangles: new InstanceProvider<TriangleInstance>(),
    squares: new InstanceProvider<SurfaceTileInstance>()
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

  currentLocation: Vec2Compat = [0, 0];

  buildConsole(_gui: datGUI.GUI): void {
    // const parameters = gui.addFolder("Parameters");
    // parameters.add(this.parameters, "addAtOnce", 0, 100000, 1);
  }

  destroy(): void {
    super.destroy();
    this.providers.cubes.clear();
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        flat: new Camera2D(),
        perspective: Camera.makePerspective({
          fov: 60 * Math.PI / 180
        })
      },
      resources: {},
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
              triangles: createLayer(TriangleLayer, {
                data: providers.triangles
              }),
              cubes: createLayer(CubeLayer, {
                data: providers.cubes
              }),
              squares: createLayer(SurfaceTileLayer, {
                data: providers.squares,
                picking: PickType.SINGLE,

                onMouseOver: info => {
                  info.instances.forEach(i => {
                    i.color = [1, 1, 0, 1];
                  });
                },

                onMouseOut: info => {
                  info.instances.forEach(i => {
                    i.color = color4FromHex3(0xffffff - i.uid);
                  });
                }
              })
            }
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;
    await this.surface.ready;

    const perlin = new PerlinNoise({
      width: 256,
      height: 256,
      blendPasses: 5,
      octaves: [[16, 64], [128, 16], [128, 128], [256, 256], [512, 512]],
      valueRange: [0, 1]
    });

    await perlin.generate();
    this.surface.cameras.perspective.position = [0, 0, 100];
    this.surface.cameras.perspective.lookAt([1280, 50, -1280], [0, 1, 0]);

    // Add an extra row and column to make over sampling not break the loop
    const data = perlin.data.slice(0);
    data.push(perlin.data[perlin.data.length - 1].slice(0));
    data.forEach(row => row.push(row[row.length - 1]));

    for (let i = 0, iMax = perlin.data.length; i < iMax; ++i) {
      const row = perlin.data[i];

      for (let k = 0, kMax = row.length; k < kMax; ++k) {
        const tile = this.providers.squares.add(
          new SurfaceTileInstance({
            corners: [
              [i * 10, data[i][k] * 200, -k * 10],
              [(i + 1) * 10, data[i + 1][k] * 200, -k * 10],
              [(i + 1) * 10, data[i + 1][k + 1] * 200, -(k + 1) * 10],
              [i * 10, data[i][k + 1] * 200, -(k + 1) * 10]
            ]
          })
        );

        tile.color = color4FromHex3(0xffffff - tile.uid);
      }
    }

    let t = 0;

    const loop = () => {
      if (!this.surface) return;
      t += Math.PI / 120;

      this.surface.cameras.perspective.position = [
        Math.sin(t / 5) * 1280 + 1280,
        200,
        Math.cos(t / 5) * 1280 - 1280
      ];

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
