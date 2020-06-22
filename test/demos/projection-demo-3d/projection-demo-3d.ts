import * as datGUI from "dat.gui";

import {
  BasicSurface,
  ClearFlags,
  createLayer,
  createView,
  InstanceProvider,
  onAnimationLoop,
  PickType,
  rayToLocation,
  scale3,
  View3D
} from "../../../src";
import { Camera, CameraProjectionType } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";

/**
 * A very basic demo proving the system is operating as expected
 */
export class ProjectionDemo3D extends BaseDemo {
  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {
    cameraMode: "Orthographic"
  };

  /**  */
  cube: CubeInstance;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters
      .add(this.parameters, "cameraMode", {
        orthographic: "Orthographic",
        perspective: "Perspective"
      })
      .onFinishChange(() => {
        this.reset();
      });
  }

  destroy(): void {
    super.destroy();
  }

  reset() {
    if (this.surface) {
      this.destroy();
      this.providers.cubes.clear();
      this.surface.cameras.main =
        this.parameters.cameraMode === "Perspective"
          ? Camera.makePerspective({
              fov: (60 * Math.PI) / 180,
              far: 100000
            })
          : Camera.makeOrthographic();
      this.surface.rebuild();
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
        main:
          this.parameters.cameraMode === "Perspective"
            ? Camera.makePerspective({
                fov: (60 * Math.PI) / 180,
                far: 100000
              })
            : Camera.makeOrthographic()
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
              picking: PickType.SINGLE,
              onMouseMove: info => {
                if (!this.surface) return;
                const r = info.projection.screenRay(info.screen);
                this.cube.position = rayToLocation(r, 50);
              }
            })
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    const children: CubeInstance[] = [];
    const camera = this.surface.cameras.main;
    camera.position = [0, 10, 15];
    camera.lookAt([0, 0, -20], [0, 1, 0]);
    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 100;

    this.cube = this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        size: scale3([1, 1, 1], factor)
      })
    );

    for (let i = 0; i < 10; ++i) {
      children.push(
        this.providers.cubes.add(
          new CubeInstance({
            parent: this.cube,
            color: [0.9, 0.56, 0.2, 1],
            size: scale3([0.2, 0.2, 0.2], factor)
          })
        )
      );
    }

    let theta = 0;

    onAnimationLoop(() => {
      this.cube.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);
      children.forEach((cube, i) => {
        const offset = i * ((Math.PI * 12) / children.length);
        cube.localPosition = [
          Math.sin(theta + offset) * factor * 2,
          Math.cos((theta + offset) / 2) * factor * 2,
          Math.sin((theta + offset) / 3) * factor * 2
        ];
        // cube.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);
      });

      theta += Math.PI / 120;
    });
  }
}
