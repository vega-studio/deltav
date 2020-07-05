import * as datGUI from "dat.gui";

import {
  add3,
  BasicSurface,
  Camera2D,
  ClearFlags,
  createLayer,
  createView,
  GLSettings,
  InstanceProvider,
  onAnimationLoop,
  scale3,
  stopAnimationLoop,
  TextureSize,
  View2D,
  View3D,
  ViewOutputInformationType,

} from "../../../src";
import { createTexture } from "../../../src/resources/texture/render-texture";
import { Camera, CameraProjectionType } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";
import { RenderImageLayer } from "./render-image/render-image-layer";
/**
 * A very basic demo proving the system is operating as expected
 */
export class MultiRenderTargetDemo3D extends BaseDemo {
  /** Surface providers */
  providers = {
    screenPass: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {
    cameraMode: "Orthographic"
  };

  loopId: Promise<number>;

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
    stopAnimationLoop(this.loopId);
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
      resources: {
        tex1: createTexture({
          width: TextureSize._1024,
          height: TextureSize._512,
          textureSettings: {
            format: GLSettings.Texture.TexelDataType.RGBA,
          }
        })
      },
      eventManagers: _cameras => ({}),
      scenes: (resources, providers, cameras) => ({
        // Render our world scene to textures
        world: {
          views: {
            perspective: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              output: {
                buffers: [{ outputType: ViewOutputInformationType.COLOR, resource: resources.tex1.key }],
                depth: true
              }
            })
          },
          layers: {
            cubes: createLayer(CubeLayer, {
              data: providers.cubes
            })
          }
        },

        // Perform post processing with the resulting textures
        screen: {
          views: {
            main: createView(View2D, {
              camera: new Camera2D(),
              clearFlags: [],
            })
          },
          layers: {
            image: createLayer(RenderImageLayer, {
              data
            })
          }
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.main;
    camera.position = [0, 10, 15];
    camera.lookAt([0, 0, -20], [0, 1, 0]);
    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 100;

    const cube = this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        size: scale3([1, 1, 1], factor)
      })
    );

    this.loopId = onAnimationLoop((t: number) => {
      const theta = (t / 1400) * Math.PI * 2;
      cube.position = add3(
        [Math.sin(theta) * 10 * factor, 0, Math.cos(theta) * 10 * factor],
        [0, 0, -20]
      );

      cube.transform.lookAtLocal(
        add3(cube.transform.position, [
          Math.cos(-theta),
          Math.sin(-theta / 20),
          Math.sin(-theta)
        ]),
        [0, 1, 0]
      );
    }, 1000);
  }
}
