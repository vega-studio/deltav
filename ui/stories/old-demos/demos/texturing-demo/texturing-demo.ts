import * as datGUI from "dat.gui";

import {
  add3,
  BasicSurface,
  ClearFlags,
  createAtlas,
  createLayer,
  createView,
  InstanceProvider,
  onAnimationLoop,
  scale3,
  stopAnimationLoop,
  TextureSize,
  View3D,
  WebGLStat,
} from "../../../../src";
import { Camera, CameraProjectionType } from "../../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";
import GrassPNG from "./assets/grass.png";
import DirtPNG from "./assets/dirt.png";

/**
 * A very basic demo proving the system is operating as expected
 */
export class TexturingDemo extends BaseDemo {
  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>(),
  };

  /** GUI properties */
  parameters = {
    cameraMode: "Orthographic",
  };

  loopId?: Promise<number>;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters
      .add(this.parameters, "cameraMode", {
        orthographic: "Orthographic",
        perspective: "Perspective",
      })
      .onFinishChange(() => {
        this.reset();
      });
  }

  destroy(): void {
    super.destroy();
    if (this.loopId) stopAnimationLoop(this.loopId);
  }

  reset() {
    if (this.surface) {
      this.destroy();
      this.providers.cubes.clear();
      this.surface.cameras.main =
        this.parameters.cameraMode === "Perspective"
          ? Camera.makePerspective({
              fov: (60 * Math.PI) / 180,
              far: 100000,
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
        antialias: true,
      },
      providers: this.providers,
      cameras: {
        main:
          this.parameters.cameraMode === "Perspective"
            ? Camera.makePerspective({
                fov: (60 * Math.PI) / 180,
                far: 100000,
              })
            : Camera.makeOrthographic(),
      },
      resources: {
        atlas: createAtlas({
          key: "atlas",
          width: Math.min(TextureSize._4096, WebGLStat.MAX_TEXTURE_SIZE),
          height: Math.min(TextureSize._4096, WebGLStat.MAX_TEXTURE_SIZE),
        }),
      },
      eventManagers: (_cameras) => ({}),
      scenes: (resources, providers, cameras) => ({
        main: {
          views: {
            perspective: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            }),
          },
          layers: {
            cubes: createLayer(CubeLayer, {
              atlas: resources.atlas,
              data: providers.cubes,
            }),
          },
        },
      }),
    });
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.main;
    camera.position = [0, 10, 15];
    camera.lookAt([0, 0, -20], [0, 1, 0]);
    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 100;
    const cubes: CubeInstance[] = [];

    for (let i = -3; i < 3; ++i) {
      const cube = this.providers.cubes.add(
        new CubeInstance({
          topTexture: GrassPNG,
          sideTexture: DirtPNG,
          size: scale3([1, 1, 1], factor),
        })
      );

      cube.transform.position = [factor * 2 * i + 5, 0, 0];
      cubes.push(cube);
    }

    this.loopId = onAnimationLoop((t: number) => {
      const theta = (t / 1400) * Math.PI * 2;
      cubes.forEach((cube, i) => {
        cube.position = add3(
          [
            Math.sin(theta + i) * 10 * factor,
            0,
            Math.cos(theta + i) * 10 * factor,
          ],
          [0, 0, -20]
        );

        cube.transform.lookAtLocal(
          add3(cube.transform.position, [
            Math.cos(-theta + i),
            Math.sin(-(theta + i) / 20),
            Math.sin(-theta + i),
          ]),
          [0, 1, 0]
        );
      });
    }, 2000);
  }
}
