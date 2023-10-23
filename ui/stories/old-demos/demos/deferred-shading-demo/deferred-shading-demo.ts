import * as datGUI from "dat.gui";

import {
  add3,
  BasicSurface,
  ClearFlags,
  createLayer,
  createTexture,
  createView,
  FragmentOutputType,
  GLSettings,
  InstanceProvider,
  onAnimationLoop,
  PostEffect,
  postProcess,
  scale3,
  stopAnimationLoop,
  TextureSize,
  Transform,
  UniformSize,
  Vec3,
  View3D,
  WebGLStat
} from "../../../../src";
import { Camera, CameraProjectionType } from "../../../../src/util/camera";
import { BaseDemo } from "../../common/base-demo";
import { CubeInstance } from "./cube/cube-instance";
import { CubeLayer } from "./cube/cube-layer";

/**
 * Shows off deferred shading using this engine. Showcases how configuration is
 * flexible enough to make crazy complex systems work.
 */
export class DeferredShadingDemo extends BaseDemo {
  light: Vec3 = [1000, 1000, 1000];

  /** Surface providers */
  providers = {
    cubes: new InstanceProvider<CubeInstance>(),
    lights: new InstanceProvider<CubeInstance>()
  };

  /** GUI properties */
  parameters = {
    cameraMode: "Orthographic",
    ambience: 0.3
  };

  loopId!: Promise<number>;

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

    parameters.add(this.parameters, "ambience", 0, 1, 0.01);
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
    const hasFloat =
      WebGLStat.FLOAT_TEXTURE_WRITE.full || WebGLStat.FLOAT_TEXTURE_WRITE.half;

    if (!hasFloat) {
      this.message(
        "This device does not support FLOAT textures so it is using a compatibility mode which may hinder performance significantly."
      );
    }

    if (hasFloat) return this.makeSurfaceFloat(container);
    return this.makeSurfaceFloatCompat(container);
  }

  /**
   * Makes a surface that is compatible with FLOAT texture support
   */
  makeSurfaceFloat(container: HTMLElement) {
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
        color: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest
          }
        }),
        normal: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest
          }
        }),
        position: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            internalFormat: GLSettings.Texture.TexelDataType.RGBA32F,
            format: GLSettings.Texture.TexelDataType.RGBA,
            type: GLSettings.Texture.SourcePixelFormat.Float,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest
          }
        }),
        depth: createTexture({
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
        bloom: this.makeBloomResources()
      },
      eventManagers: _cameras => ({}),
      scenes: (resources, providers, cameras) => ({
        main: {
          views: {
            world: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              output: {
                buffers: {
                  [FragmentOutputType.COLOR]: resources.color,
                  [FragmentOutputType.NORMAL]: resources.normal,
                  [FragmentOutputType.POSITION]: resources.position
                },
                depth: resources.depth
              }
            })
          },
          layers: {
            blocks: createLayer(CubeLayer, {
              data: providers.cubes
            })
          }
        },
        lights: {
          views: {
            world: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR],
              background: [0, 0, 0, 0],
              output: {
                buffers: {
                  [FragmentOutputType.GLOW]: resources.bloom.glow
                },
                depth: resources.depth
              }
            })
          },
          layers: {
            blocks: createLayer(CubeLayer, {
              data: providers.lights
            })
          }
        },
        postProcessing: {
          bloom: PostEffect.bloom({
            samples: 6,
            resources: [
              resources.bloom.glow,
              resources.bloom.blur1,
              resources.bloom.blur2,
              resources.bloom.blur3,
              resources.bloom.blur4,
              resources.bloom.blur5,
              resources.bloom.blur6,
              resources.bloom.blur7,
              resources.bloom.blur8
            ]
          }),
          output: postProcess({
            buffers: {
              normals: resources.normal,
              colors: resources.color,
              positions: resources.position,
              glows: resources.bloom.blur1
            },
            uniforms: [
              {
                name: "lightPosition",
                size: UniformSize.THREE,
                update: () => this.light
              },
              {
                name: "ambience",
                size: UniformSize.ONE,
                update: () => [this.parameters.ambience]
              }
            ],
            shader: `
              varying vec2 texCoord;

              void main() {
                // Retrieve data from G-buffer
                vec3 FragPos = texture(positions, texCoord).rgb;
                vec3 Normal = texture(normals, texCoord).rgb;
                vec3 Albedo = texture(colors, texCoord).rgb;

                // Then calculate lighting as usual
                vec3 lighting = Albedo * ambience; // hard-coded ambient component
                float ambienceAdjust = 1.0 - ambience;

                vec3 dir = lightPosition - FragPos;
                float distance = length(lightPosition - FragPos);
                vec3 lightDir = dir / distance;
                vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Albedo * vec3(1., 1., 1.) * ambienceAdjust;
                lighting += diffuse;

                vec4 glow = texture(glows, texCoord);
                $\{out: color} = vec4(lighting, 1.0) + glow;
              }
            `
          }) as any
        }
      })
    });
  }

  /**
   * Make a surface that is in a compatibility mode to make up for lack of float
   * textures.
   *
   * Without a float texture we can cheat by using MRT and output to THREE
   * textures that each take an axis for the positional information. We have a
   * convenient shader module to help with this: packFloat which provides
   *
   * packFloat(float, range)
   *
   * and
   *
   * unpackFloat(float, range)
   */
  makeSurfaceFloatCompat(container: HTMLElement) {
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
        color: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest
          }
        }),
        normal: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest
          }
        }),
        positionX: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
            premultiplyAlpha: false
          }
        }),
        positionY: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
            premultiplyAlpha: false
          }
        }),
        positionZ: createTexture({
          width: TextureSize.SCREEN,
          height: TextureSize.SCREEN,
          textureSettings: {
            generateMipMaps: false,
            minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
            magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
            premultiplyAlpha: false
          }
        }),
        depth: createTexture({
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
        bloom: this.makeBloomResources()
      },
      eventManagers: _cameras => ({}),
      scenes: (resources, providers, cameras) => ({
        main: {
          views: {
            // Let's assume no more than 4 color attachments for weaker devices
            positions: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
              output: {
                buffers: {
                  [FragmentOutputType.POSITION_X]: resources.positionX,
                  [FragmentOutputType.POSITION_Y]: resources.positionY,
                  [FragmentOutputType.POSITION_Z]: resources.positionZ
                },
                depth: resources.depth
              }
            }),
            colorNormal: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR],
              output: {
                buffers: {
                  [FragmentOutputType.COLOR]: resources.color,
                  [FragmentOutputType.NORMAL]: resources.normal
                },
                depth: resources.depth
              }
            })
          },
          layers: {
            blocks: createLayer(CubeLayer, {
              data: providers.cubes,
              materialOptions: {
                blending: null
              }
            })
          }
        },
        lights: {
          views: {
            world: createView(View3D, {
              camera: cameras.main,
              clearFlags: [ClearFlags.COLOR],
              background: [0, 0, 0, 0],
              output: {
                buffers: {
                  [FragmentOutputType.GLOW]: resources.bloom.glow
                },
                depth: resources.depth
              }
            })
          },
          layers: {
            blocks: createLayer(CubeLayer, {
              data: providers.lights
            })
          }
        },
        postProcessing: {
          bloom: PostEffect.bloom({
            samples: 6,
            resources: [
              resources.bloom.glow,
              resources.bloom.blur1,
              resources.bloom.blur2,
              resources.bloom.blur3,
              resources.bloom.blur4,
              resources.bloom.blur5,
              resources.bloom.blur6,
              resources.bloom.blur7,
              resources.bloom.blur8
            ]
          }),
          output: postProcess({
            buffers: {
              normals: resources.normal,
              colors: resources.color,
              positionX: resources.positionX,
              positionY: resources.positionY,
              positionZ: resources.positionZ,
              glows: resources.bloom.blur1
            },
            uniforms: [
              {
                name: "lightPosition",
                size: UniformSize.THREE,
                update: () => this.light
              },
              {
                name: "ambience",
                size: UniformSize.ONE,
                update: () => [this.parameters.ambience]
              }
            ],
            shader: `
              $\{import: packFloat}
              varying vec2 texCoord;

              void main() {
                // Retrieve data from G-buffer
                vec3 FragPos = vec3(
                  unpackFloat(texture(positionX, texCoord), 2600.),
                  unpackFloat(texture(positionY, texCoord), 2600.),
                  unpackFloat(texture(positionZ, texCoord), 2600.)
                );
                vec3 Normal = texture(normals, texCoord).rgb;
                vec3 Albedo = texture(colors, texCoord).rgb;

                // Then calculate lighting as usual
                vec3 lighting = Albedo * ambience; // hard-coded ambient component
                float ambienceAdjust = 1.0 - ambience;

                vec3 dir = lightPosition - FragPos;
                float distance = length(lightPosition - FragPos);
                vec3 lightDir = dir / distance;
                vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Albedo * vec3(1., 1., 1.) * ambienceAdjust;
                lighting += diffuse;

                vec4 glow = texture(glows, texCoord);
                $\{out: color} = vec4(lighting, 1.0) + glow;
              }
            `
          }) as any
        }
      })
    });
  }

  makeBloomResources() {
    return {
      glow: createTexture({
        width: TextureSize.SCREEN,
        height: TextureSize.SCREEN,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur1: createTexture({
        width: TextureSize.SCREEN_HALF,
        height: TextureSize.SCREEN_HALF,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur2: createTexture({
        width: TextureSize.SCREEN_QUARTER,
        height: TextureSize.SCREEN_QUARTER,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur3: createTexture({
        width: TextureSize.SCREEN_8TH,
        height: TextureSize.SCREEN_8TH,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur4: createTexture({
        width: TextureSize.SCREEN_16TH,
        height: TextureSize.SCREEN_16TH,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur5: createTexture({
        width: TextureSize.SCREEN_32ND,
        height: TextureSize.SCREEN_32ND,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur6: createTexture({
        width: TextureSize.SCREEN_64TH,
        height: TextureSize.SCREEN_64TH,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur7: createTexture({
        width: TextureSize.SCREEN_128TH,
        height: TextureSize.SCREEN_128TH,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      }),
      blur8: createTexture({
        width: TextureSize.SCREEN_256TH,
        height: TextureSize.SCREEN_256TH,
        textureSettings: {
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGB,
          internalFormat: GLSettings.Texture.TexelDataType.RGB
        }
      })
    };
  }

  async init() {
    if (!this.surface) return;

    const camera = this.surface.cameras.main;
    camera.position = [0, 100, 150];
    camera.lookAt([0, 0, 0], [0, 1, 0]);
    const factor =
      camera.projectionType === CameraProjectionType.PERSPECTIVE ? 1 : 25;

    const parent = new Transform();
    const cubes: CubeInstance[] = [];
    const range = factor * 100;

    const cubeLight = this.providers.lights.add(
      new CubeInstance({
        color: [1, 1, 1, 1],
        frontColor: [1, 1, 1, 1],
        size: scale3([1, 1, 1], factor)
      })
    );

    for (let i = 0, iMax = 250; i < iMax; ++i) {
      const cube = this.providers.cubes.add(
        new CubeInstance({
          color: [0.9, 0.56, 0.2, 1],
          size: scale3([1, 1, 1], factor),
          transform: new Transform({
            parent,
            localPosition: [
              Math.random() * range - range / 2 + factor,
              Math.random() * range - range / 2 + factor,
              Math.random() * range - range / 2 + factor
            ]
          })
        })
      );

      cubes.push(cube);
    }

    this.loopId = onAnimationLoop((t: number) => {
      const theta = (t / 1400) * Math.PI * 2;

      this.light = [
        Math.sin(-theta / 20) * factor * 100,
        Math.sin(-theta / 20) * factor * 100,
        Math.sin(-theta) * factor * 0
      ];

      cubeLight.localPosition = this.light;
      cubeLight.transform.lookAtLocal(
        add3(cubeLight.localPosition, [
          Math.cos(-theta),
          Math.sin(-theta / 20),
          Math.sin(-theta)
        ]),
        [0, 1, 0]
      );

      parent.lookAtLocal([
        Math.cos(-theta / 50),
        Math.sin(-theta / 100),
        Math.sin(-theta / 50)
      ]);

      cubes.forEach((cube, i) => {
        const scale = i / cubes.length;

        cube.transform.lookAtLocal(
          add3(cube.transform.localPosition, [
            Math.cos(-theta * scale),
            Math.sin((-theta / 20) * scale),
            Math.sin(-theta * scale)
          ]),
          [0, 1, 0]
        );
      });
    });
  }
}
