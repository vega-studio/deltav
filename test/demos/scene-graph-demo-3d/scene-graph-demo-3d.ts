import * as datGUI from "dat.gui";
import {
  BasicSurface,
  ClearFlags,
  createLayer,
  createView,
  EulerOrder,
  fromOrderedEulerToQuat,
  InstanceProvider,
  length2,
  onAnimationLoop,
  PickType,
  stopAnimationLoop,
  Transform,
  View3D
} from "../../../src";
import { Camera, CameraProjectionType } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";

/**
 * A very basic demo proving the system is operating as expected
 */
export class SceneGraphDemo3D extends BaseDemo {
  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {
    orthographic: () => {
      this.reset(
        Camera.makeOrthographic({
          far: 10000
        })
      );
    },
    perspective: () => {
      this.reset(
        Camera.makePerspective({
          fov: (60 * Math.PI) / 180,
          far: 10000
        })
      );
    },
    tension: 1,
    rotate: false
  };

  loopId: Promise<number>;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters.add(this.parameters, "orthographic");
    parameters.add(this.parameters, "perspective");
    parameters.add(this.parameters, "tension", 0, 2, 0.01);
    parameters.add(this.parameters, "rotate");
  }

  destroy(): void {
    super.destroy();
  }

  reset(camera: Camera) {
    if (this.surface) {
      this.destroy();
      this.surface.destroy();
      this.providers.cubes.clear();
      this.surface.cameras.main = camera;
      this.surface.rebuild();
      stopAnimationLoop(this.loopId);
      this.init();
    }
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        main: Camera.makePerspective({
          fov: (60 * Math.PI) / 180,
          far: 10000
        })
      },
      resources: {},
      eventManagers: _cameras => ({}),
      scenes: (_resources, providers, cameras) => ({
        main: {
          views: {
            perspective: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH]
            })
          },
          layers: {
            cubes: createLayer(CubeLayer, {
              data: providers.cubes,
              picking: PickType.SINGLE
            })
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.main;
    camera.position = [0, 20, 515];
    camera.lookAt([0, 0, 0], [0, 1, 0]);
    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 10;

    const root = this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        frontColor: [Math.random(), Math.random(), Math.random(), 1],
        size: [factor, factor, factor],
        transform: new Transform({
          localPosition: [0, 0, 0]
        })
      })
    );

    const count = 200;
    const cubes: CubeInstance[] = [];

    let parent = root;
    for (let i = 0; i < count; ++i) {
      parent = this.providers.cubes.add(
        new CubeInstance({
          parent,
          color: [0.9, 0.56, 0.2, 1],
          frontColor: [Math.random(), Math.random(), Math.random(), 1],
          size: [factor, factor, factor],
          transform: new Transform({
            localPosition: [factor, 0, 0]
          })
        })
      );

      cubes.push(parent);
    }

    parent = root;
    for (let i = 0; i < count; ++i) {
      parent = this.providers.cubes.add(
        new CubeInstance({
          parent,
          color: [0.9, 0.56, 0.2, 1],
          frontColor: [Math.random(), Math.random(), Math.random(), 1],
          size: [factor, factor, factor],
          transform: new Transform({
            localPosition: [-factor, 0, 0]
          })
        })
      );

      cubes.push(parent);
    }

    parent = root;
    for (let i = 0; i < count; ++i) {
      parent = this.providers.cubes.add(
        new CubeInstance({
          parent,
          color: [0.9, 0.56, 0.2, 1],
          frontColor: [Math.random(), Math.random(), Math.random(), 1],
          size: [factor, factor, factor],
          transform: new Transform({
            localPosition: [0, factor, 0]
          })
        })
      );

      cubes.push(parent);
    }

    parent = root;
    for (let i = 0; i < count; ++i) {
      parent = this.providers.cubes.add(
        new CubeInstance({
          parent,
          color: [0.9, 0.56, 0.2, 1],
          frontColor: [Math.random(), Math.random(), Math.random(), 1],
          size: [factor, factor, factor],
          transform: new Transform({
            localPosition: [0, -factor, 0]
          })
        })
      );

      cubes.push(parent);
    }

    parent = root;
    for (let i = 0; i < count; ++i) {
      parent = this.providers.cubes.add(
        new CubeInstance({
          parent,
          color: [0.9, 0.56, 0.2, 1],
          frontColor: [Math.random(), Math.random(), Math.random(), 1],
          size: [factor, factor, factor],
          transform: new Transform({
            localPosition: [0, 0, factor]
          })
        })
      );

      cubes.push(parent);
    }

    parent = root;
    for (let i = 0; i < count; ++i) {
      parent = this.providers.cubes.add(
        new CubeInstance({
          parent,
          color: [0.9, 0.56, 0.2, 1],
          frontColor: [Math.random(), Math.random(), Math.random(), 1],
          size: [factor, factor, factor],
          transform: new Transform({
            localPosition: [0, 0, -factor]
          })
        })
      );

      cubes.push(parent);
    }

    const cube = this.providers.cubes.add(
      new CubeInstance({
        color: [1, 0, 0, 1],
        frontColor: [0, 1, 0, 1],
        size: [factor * 2, factor * 2, factor * 2],
        transform: new Transform({
          localPosition: [0, 0, -factor]
        })
      })
    );

    // Animate some changes
    this.loopId = onAnimationLoop(() => {
      const time = Date.now() * 0.001 + 10000;
      const rx = Math.sin(time * 0.7) * 0.2 * this.parameters.tension;
      const ry = Math.sin(time * 0.3) * 0.1 * this.parameters.tension;
      const rz = Math.sin(time * 0.2) * 0.1 * this.parameters.tension;
      const rotation = fromOrderedEulerToQuat([rx, ry, rz], EulerOrder.xyz);
      cubes.forEach(cube => {
        cube.localRotation = rotation;
      });

      const distance = length2([camera.position[0], camera.position[2]]);

      // Rotate camera around the rendering
      if (this.parameters.rotate) {
        camera.position = [
          Math.sin(time) * distance,
          camera.position[1],
          -Math.cos(time) * distance
        ];
        camera.lookAt([0, 0, 0]);
      }

      cube.position = [
        (Math.sin(time) * distance) / 2,
        -50,
        (-Math.cos(time) * distance) / 2
      ];
      cube.transform.lookAtLocal([0, 0, 0]);
    });
  }
}
