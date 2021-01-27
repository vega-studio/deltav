import * as datGUI from "dat.gui";

import {
  BasicSurface,
  Camera,
  CameraProjectionType,
  ClearFlags,
  createLayer,
  createTexture,
  createView,
  FragmentOutputType,
  fromEulerAxisAngleToQuat,
  GLSettings,
  InstanceProvider,
  normalize3,
  onAnimationLoop,
  PostEffect,
  scale3,
  stopAnimationLoop,
  TextureSize,
  Transform,
  vec3,
  View3D
} from "../../../src";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";
/**
 * A very basic demo proving the system is operating as expected
 */
export class MultiRenderTargetDemo3D extends BaseDemo {
  /** Surface providers */
  providers = {
    screenPass: new InstanceProvider<CubeInstance>(),
    cubes: new InstanceProvider<CubeInstance>(),
    noGlow: new InstanceProvider<CubeInstance>(),
    noColor: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {
    glow: true,

    "No Bloom": () => {
      this.parameters.glow = false;
      this.reset();
    },

    Bloom: () => {
      this.parameters.glow = true;
      this.reset();
    }
  };

  loopId: Promise<number>;

  buildConsole(gui: datGUI.GUI): void {
    const parameters = gui.addFolder("Parameters");
    parameters.add(this.parameters, "Bloom");
    parameters.add(this.parameters, "No Bloom");
  }

  destroy(): void {
    super.destroy();
    stopAnimationLoop(this.loopId);
  }

  reset() {
    if (this.surface) {
      this.destroy();
      Object.keys(this.providers).forEach(key =>
        (this.providers as any)[key].clear()
      );
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
        main: Camera.makePerspective({
          fov: (60 * Math.PI) / 180,
          far: 100000
        })
      },
      resources: {
        color: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        buffer: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        glow: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur1: createTexture({
          width: TextureSize.SCREEN_HALF,
          height: TextureSize.SCREEN_HALF,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur2: createTexture({
          width: TextureSize.SCREEN_QUARTER,
          height: TextureSize.SCREEN_QUARTER,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur3: createTexture({
          width: TextureSize.SCREEN_8TH,
          height: TextureSize.SCREEN_8TH,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur4: createTexture({
          width: TextureSize.SCREEN_16TH,
          height: TextureSize.SCREEN_16TH,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur5: createTexture({
          width: TextureSize.SCREEN_32ND,
          height: TextureSize.SCREEN_32ND,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur6: createTexture({
          width: TextureSize.SCREEN_64TH,
          height: TextureSize.SCREEN_64TH,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur7: createTexture({
          width: TextureSize.SCREEN_128TH,
          height: TextureSize.SCREEN_128TH,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
          }
        }),
        blur8: createTexture({
          width: TextureSize.SCREEN_256TH,
          height: TextureSize.SCREEN_256TH,
          textureSettings: {
            generateMipMaps: false,
            format: GLSettings.Texture.TexelDataType.RGB
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
              output: this.parameters.glow
                ? {
                    buffers: {
                      [FragmentOutputType.COLOR]: resources.color,
                      [FragmentOutputType.ACCUMULATION1]: resources.buffer,
                      [FragmentOutputType.GLOW]: resources.glow
                    },
                    depth: true
                  }
                : void 0
            })
          },
          layers: {
            cubes: createLayer(CubeLayer, {
              printShader: true,
              data: providers.cubes
            }),
            noColorCubes: createLayer(CubeLayer, {
              printShader: true,
              data: providers.noColor,
              mapOutput: this.parameters.glow
                ? {
                    [FragmentOutputType.COLOR]: FragmentOutputType.ACCUMULATION1
                  }
                : void 0
            }),
            noGlowCubes: createLayer(CubeLayer, {
              printShader: true,
              data: providers.noGlow,
              mapOutput: {
                [FragmentOutputType.GLOW]: FragmentOutputType.NONE
              }
            })
          }
        },

        // Perform post processing with the resulting textures
        postEffects: {
          bloom: PostEffect.bloom({
            samples: 6,
            resources: [
              resources.glow,
              resources.blur1,
              resources.blur2,
              resources.blur3,
              resources.blur4,
              resources.blur5,
              resources.blur6,
              resources.blur7,
              resources.blur8
            ],
            compose: resources.color
          })
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    // Place the camera where it can view everything
    const camera = this.surface.cameras.main;
    camera.position = [0, 0, 25];
    camera.lookAt([0, 0, -20], [0, 1, 0]);
    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 100;

    // Make a central cube to parent everything around
    const core1 = this.providers.cubes.add(
      new CubeInstance({
        color: [0, 0, 0, 1],
        size: scale3([1, 1, 1], factor)
      })
    );

    const core2 = new Transform();
    const core3 = new Transform();

    // Make a cool spherical layout of cubes
    let fill = 2;
    const cubes: CubeInstance[] = [];
    for (let i = -fill, iMax = fill + 1; i < iMax; ++i) {
      for (let k = -fill, kMax = fill + 1; k < kMax; ++k) {
        for (let z = -fill, zMax = fill + 1; z < zMax; ++z) {
          const c = new CubeInstance({
            parent: core1,
            color: [0, 0, 0, 1],
            glow: [
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.8 + 0.2,
              1
            ],
            size: scale3([1, 1, 1], factor)
          });

          c.localPosition = scale3(normalize3(vec3(i, k, z)), 10);
          c.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);

          cubes.push(this.providers.cubes.add(c));
        }
      }
    }

    fill = 1;
    for (let i = -fill, iMax = fill + 1; i < iMax; ++i) {
      for (let k = -fill, kMax = fill + 1; k < kMax; ++k) {
        for (let z = -fill, zMax = fill + 1; z < zMax; ++z) {
          const c = new CubeInstance({
            parent: core2,
            color: [0, 0, 0, 1],
            glow: [
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.8 + 0.2,
              1
            ],
            size: scale3([1, 1, 1], factor)
          });

          c.localPosition = scale3(normalize3(vec3(i, k, z)), 5);
          c.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);

          cubes.push(this.providers.noGlow.add(c));
        }
      }
    }

    fill = 1;
    for (let i = -fill, iMax = fill + 1; i < iMax; ++i) {
      for (let k = -fill, kMax = fill + 1; k < kMax; ++k) {
        for (let z = -fill, zMax = fill + 1; z < zMax; ++z) {
          const c = new CubeInstance({
            parent: core3,
            color: [0, 0, 0, 1],
            glow: [
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.8 + 0.2,
              Math.random() * 0.8 + 0.2,
              1
            ],
            size: scale3([1, 1, 1], factor)
          });

          c.localPosition = scale3(normalize3(vec3(i, k, z)), 15);
          c.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);

          cubes.push(this.providers.noColor.add(c));
        }
      }
    }

    let change = 0;

    // Move things around by making the core look around
    // Also change the cubes colors randomly for extra disco
    this.loopId = onAnimationLoop((_t: number) => {
      const tension = 1;

      const time = Date.now() * 0.001 + 10000;
      const rx = Math.sin(time * 0.7) * 0.2 * tension;
      const ry = Math.sin(time * 0.3) * 0.1 * tension;
      const rz = Math.sin(time * 0.2) * 0.1 * tension;
      core1.transform.lookAtLocal([rx, ry, rz], [0, 1, 0]);
      core2.localRotation = fromEulerAxisAngleToQuat([rx, 1, 0], time / 1);
      core3.lookAtLocal([rx, -ry, -rz], [0, 1, 0]);

      if (++change >= cubes.length) change = 0;

      cubes[change].glow = [
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        Math.random() * 0.8 + 0.2,
        1
      ];
    });
  }
}
