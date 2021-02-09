import * as datGUI from "dat.gui";
import {
  BasicSurface,
  ClearFlags,
  createLayer,
  createView,
  EulerOrder,
  fromOrderedEulerToQuat,
  InstanceProvider,
  onAnimationLoop,
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
export class CameraSceneGraphDemo extends BaseDemo {
  top: CubeInstance;
  left: CubeInstance;
  right: CubeInstance;
  bottom: CubeInstance;

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
    stopFollowing: () => {
      if (!this.surface) return;
      this.surface.cameras.main.transform.parent = void 0;
    },
    followTop: () => {
      if (!this.surface) return;
      this.surface.cameras.main.transform.parent = this.top.transform;
    },
    followLeft: () => {
      if (!this.surface) return;
      this.surface.cameras.main.transform.parent = this.left.transform;
    },
    followRight: () => {
      if (!this.surface) return;
      this.surface.cameras.main.transform.parent = this.right.transform;
    },
    followBottom: () => {
      if (!this.surface) return;
      this.surface.cameras.main.transform.parent = this.bottom.transform;
    }
  };

  loopId: Promise<number>;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters.add(this.parameters, "orthographic");
    parameters.add(this.parameters, "perspective");
    parameters.add(this.parameters, "stopFollowing");
    parameters.add(this.parameters, "followTop");
    parameters.add(this.parameters, "followLeft");
    parameters.add(this.parameters, "followRight");
    parameters.add(this.parameters, "followBottom");
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
              data: providers.cubes
            })
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.main;
    camera.position = [0, 100, -125];
    camera.lookAt([0, 0, 0], [0, 1, 0]);
    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 10;

    this.left = this.providers.cubes.add(
      new CubeInstance({
        color: [1, 0, 0, 1],
        frontColor: [Math.random(), Math.random(), Math.random(), 1],
        size: [factor, factor, factor],
        transform: new Transform({
          localPosition: [-20 * factor, 0, 0]
        })
      })
    );

    this.right = this.providers.cubes.add(
      new CubeInstance({
        color: [0, 1, 0, 1],
        frontColor: [Math.random(), Math.random(), Math.random(), 1],
        size: [factor, factor, factor],
        transform: new Transform({
          localPosition: [20 * factor, 0, 0]
        })
      })
    );

    this.top = this.providers.cubes.add(
      new CubeInstance({
        color: [0, 0, 1, 1],
        frontColor: [Math.random(), Math.random(), Math.random(), 1],
        size: [factor, factor, factor],
        transform: new Transform({
          localPosition: [0, 0, 20 * factor]
        })
      })
    );

    this.bottom = this.providers.cubes.add(
      new CubeInstance({
        color: [1, 0, 1, 1],
        frontColor: [Math.random(), Math.random(), Math.random(), 1],
        size: [factor, factor, factor],
        transform: new Transform({
          localPosition: [0, 0, -20 * factor]
        })
      })
    );

    // Animate some changes
    this.loopId = onAnimationLoop(t => {
      const rotation = fromOrderedEulerToQuat([0, t / 1000, 0], EulerOrder.xyz);
      this.top.localRotation = rotation;
      this.left.localRotation = rotation;
      this.right.localRotation = rotation;
      this.bottom.localRotation = rotation;
    });
  }
}
