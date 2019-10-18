import * as datGUI from "dat.gui";
import {
  add3,
  BasicSurface,
  ClearFlags,
  createLayer,
  createView,
  InstanceProvider,
  onAnimationLoop,
  stopAnimationLoop,
  Transform,
  View3D
} from "../../../src";
import { Camera } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";

/**
 * A very basic demo proving the system is operating as expected
 */
export class CubeDemo3D extends BaseDemo {
  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {};

  loopId: number;

  buildConsole(_gui: datGUI.GUI): void {
    // const parameters = gui.addFolder("Parameters");
    // parameters.add(this.parameters, "addAtOnce", 0, 100000, 1);
  }

  destroy(): void {
    super.destroy();
    stopAnimationLoop(this.loopId);
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        perspective: Camera.makePerspective({
          fov: 60 * Math.PI / 180,
          far: 100000
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

    const transform = new Transform();
    const camera = this.surface.cameras.perspective;
    camera.position = [0, 10, 10];
    camera.lookAt([0, 0, 0], [0, 1, 0]);

    const cube = this.providers.cubes.add(
      new CubeInstance({
        transform,
        color: [0.9, 0.56, 0.2, 1]
      })
    );

    this.loopId = onAnimationLoop((t: number) => {
      const theta = t / 1400 * Math.PI * 2;
      transform.position = [Math.sin(theta) * 3, 0, Math.cos(theta) * 3];
      transform.lookAt(
        add3(transform.position, [
          Math.cos(-theta),
          Math.sin(-theta / 20),
          Math.sin(-theta)
        ]),
        [0, 1, 0]
      );
      cube.transform = transform;
    }, 1000);
  }
}
