import * as datGUI from "dat.gui";

import {
  add3,
  BasicSurface,
  ClearFlags,
  createLayer,
  createScene,
  createTexture,
  createView,
  EulerOrder,
  FragmentOutputType,
  GLSettings,
  InstanceProvider,
  onAnimationLoop,
  PostEffect,
  QuaternionMath,
  scale3,
  stopAnimationLoop,
  TextureSize,
  Transform,
  View3D
} from "../../../src";
import { createColorBuffer } from "../../../src/resources/color-buffer";
import { Camera } from "../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";

/**
 * A very basic demo proving the system is operating as expected
 */
export class ShadowDemo extends BaseDemo {
  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {
    light: {
      viewWidth: 3000,
      viewHeight: 3000,
      near: 0,
      far: 10000,
      angle: 0,
      shadowBias: 0.005
    },
    cameraNear: 0,
    cameraFar: 5000
  };

  loopId: Promise<number>;

  buildConsole(gui: datGUI.GUI): void {
    const updateLight = () => {
      if (!this.surface) return;
      this.surface.cameras.light.setOrthographic(this.getOrtho());
      this.surface.cameras.light.position = [
        Math.sin(this.parameters.light.angle) * 10,
        10,
        Math.cos(this.parameters.light.angle) * 10
      ];
      this.surface.cameras.light.lookAt([0, 0, 0], [0, 1, 0]);
      this.surface.cameras.main.setOrthographic({
        near: this.parameters.cameraNear,
        far: this.parameters.cameraFar
      });
    };

    const parameters = gui.addFolder("Parameters");

    parameters
      .add(this.parameters.light, "viewWidth", 0, 5000)
      .onChange(updateLight);
    parameters
      .add(this.parameters.light, "viewHeight", 0, 5000)
      .onChange(updateLight);
    parameters
      .add(this.parameters.light, "near", 0, 1000)
      .onChange(updateLight);
    parameters
      .add(this.parameters.light, "far", 0, 20000)
      .onChange(updateLight);
    parameters
      .add(this.parameters.light, "angle", 0, Math.PI * 2, Math.PI / 180)
      .onChange(updateLight);
    parameters.add(this.parameters.light, "shadowBias", 0, 0.01, 0.001);

    parameters
      .add(this.parameters, "cameraNear", 0, 1000)
      .onChange(updateLight);
    parameters
      .add(this.parameters, "cameraFar", 0, 20000)
      .onChange(updateLight);
  }

  destroy(): void {
    super.destroy();
    stopAnimationLoop(this.loopId);
  }

  reset() {
    if (this.surface) {
      this.destroy();
      this.providers.cubes.clear();
      this.surface.cameras.main = Camera.makeOrthographic();
      this.surface.rebuild();
      this.init();
    }
  }

  getOrtho() {
    return {
      left: -this.parameters.light.viewWidth / 2,
      right: this.parameters.light.viewWidth / 2,
      top: this.parameters.light.viewHeight / 2,
      bottom: -this.parameters.light.viewHeight / 2,
      near: this.parameters.light.near,
      far: this.parameters.light.far
    };
  }

  makeSurface(container: HTMLElement) {
    return new BasicSurface({
      container,
      rendererOptions: {
        antialias: true
      },
      providers: this.providers,
      cameras: {
        light: Camera.makeOrthographic(this.getOrtho()),
        main: Camera.makeOrthographic({
          near: 0,
          far: 5000
        })
      },
      resources: {
        shadowMap: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            internalFormat: GLSettings.Texture.TexelDataType.DEPTH_COMPONENT16,
            format: GLSettings.Texture.TexelDataType.DepthComponent,
            type: GLSettings.Texture.SourcePixelFormat.UnsignedShort,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
            wrapHorizontal: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE,
            wrapVertical: GLSettings.Texture.Wrapping.CLAMP_TO_EDGE
          }
        }),
        cameraDepth: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            internalFormat: GLSettings.Texture.TexelDataType.DEPTH_COMPONENT16,
            format: GLSettings.Texture.TexelDataType.DepthComponent,
            type: GLSettings.Texture.SourcePixelFormat.UnsignedShort,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest
          }
        }),
        sceneColor: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest
          }
        }),
        color: createColorBuffer({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          colorBufferSettings: {
            internalFormat: GLSettings.RenderTarget.ColorBufferFormat.R8
          }
        })
      },
      eventManagers: _cameras => ({}),
      scenes: (resources, providers, cameras) => ({
        main: createScene({
          views: {
            // Draw the stuff from the light's perspective so we fill in the
            // depth buffer with the shadow map info
            light: createView(View3D, {
              preventCameraAdjustment: true,
              camera: cameras.light,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              output: {
                // Make sure we don't output any fragment processing
                buffers: {
                  [FragmentOutputType.BLANK]: resources.color
                },
                depth: resources.shadowMap
              }
            }),

            // Draw the stuff from the camera's perspective to the screen to
            // render out the shadow shading.
            perspective: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              output: {
                // Make sure we don't output any fragment processing
                buffers: {
                  [FragmentOutputType.COLOR]: resources.sceneColor
                },
                depth: resources.cameraDepth
              }
            })
          },

          // Set up our layers that renders the scene. Provide the shadowmap
          // that will be populated with the shadow map info and provide the
          // camera that represents our light source generating the shadow so we
          // can perform the transform to pick the correct pixel from the shadow
          // map.
          layers: {
            cubes: createLayer(CubeLayer, {
              printShader: true,
              data: providers.cubes,
              lightCamera: cameras.light,
              shadowMap: resources.shadowMap,
              shadowBias: () => this.parameters.light.shadowBias
            })
          }
        }),

        // Render our depth map to the screen in the top left
        postEffects: {
          sceneOutput: PostEffect.draw({
            input: resources.sceneColor
          }),
          depth: PostEffect.draw({
            channel: "r",
            grayScale: true,
            input: resources.shadowMap,
            view: {
              viewport: { left: 10, top: 10, width: "30%", height: "30%" }
            }
          }),
          cameraDepth: PostEffect.draw({
            channel: "r",
            grayScale: true,
            input: resources.cameraDepth,
            view: {
              viewport: { left: 10, bottom: 10, width: "30%", height: "30%" }
            }
          })
        }
      })
    });
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.main;
    camera.position = [0, 200, 300];
    camera.lookAt([0, 0, 0], [0, 1, 0]);
    const factor = 100;

    const light = this.surface.cameras.light;
    light.position = [10, 10, 0];
    light.lookAt([0, 0, 0], [0, 1, 0]);

    const cube = this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        size: scale3([1, 1, 1], factor)
      })
    );

    this.providers.cubes.add(
      new CubeInstance({
        color: [0.9, 0.56, 0.2, 1],
        size: scale3([10, 1, 10], factor),
        transform: new Transform({
          localPosition: [0, -factor * 5, 0],
          localRotation: QuaternionMath.fromOrderedEulerToQuat(
            [0, Math.PI / 4, 0],
            EulerOrder.xyz
          )
        })
      })
    );

    this.loopId = onAnimationLoop((t: number) => {
      const theta = (t / 1400) * Math.PI * 2;

      cube.transform.lookAtLocal(
        add3(cube.transform.position, [
          Math.cos(-theta),
          Math.sin(-theta / 5),
          Math.sin(-theta)
        ]),
        [0, 1, 0]
      );
    });
  }
}
