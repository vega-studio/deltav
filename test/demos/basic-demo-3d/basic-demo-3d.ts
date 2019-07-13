import * as datGUI from "dat.gui";
import {
  BasicSurface,
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  createLayer,
  createView,
  InstanceProvider,
  multiply4x4,
  Size,
  Transform,
  transform4,
  Vec2Compat,
  View2D,
  View3D
} from "src";
import { CubeInstance } from "../../../src/3d/layers/cube/cube-instance";
import { CubeLayer } from "../../../src/3d/layers/cube/cube-layer";
import { TriangleInstance } from "../../../src/3d/layers/triangle/triangle-instance";
import { TriangleLayer } from "../../../src/3d/layers/triangle/triangle-layer";
import { Camera } from "../../../src/util/camera";
import { wait } from "../../../src/util/wait";
import { BaseDemo } from "../../common/base-demo";

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
    triangles: new InstanceProvider<TriangleInstance>()
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

    this.surface.cameras.perspective.position = [0, 0, 100];

    const tri = new TriangleInstance({
      transform: new Transform(),
      scale: 10
    });

    // this.providers.triangles.add(tri);

    for (let i = 0; i < 100; ++i) {
      const transform = new Transform();

      transform.position = [
        Math.random() * 100 - 50,
        Math.random() * 100 - 50,
        Math.random() * 100 - 50
      ];

      this.providers.cubes.add(
        new CubeInstance({
          color: [1, 0, 0, 1],
          transform,
          size: [
            Math.random() * 6 + 2,
            Math.random() * 6 + 2,
            Math.random() * 6 + 2
          ]
        })
      );
    }

    let t = 0;

    setInterval(() => {
      t += Math.PI / 60;

      this.surface.cameras.perspective.position = [
        Math.sin(t) * 100,
        0,
        Math.cos(t) * 100
      ];
    }, 1000 / 60);
  }
}
