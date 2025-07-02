import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../util/hooks/use-life-cycle.js";
import {
  add2,
  AutoEasingMethod,
  BloomJSX,
  Camera,
  Camera2D,
  CameraProjectionType,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  DepthBufferJSX,
  DrawJSX,
  EasingUtil,
  FragmentOutputType,
  fromEulerAxisAngleToQuat,
  GLSettings,
  type IMouseInteraction,
  InstanceProvider,
  LayerJSX,
  multiply4,
  nextFrame,
  normalize2,
  normalize3,
  onAnimationLoop,
  onFrame,
  PostProcessJSX,
  PromiseResolver,
  scale2,
  scale3,
  SceneJSX,
  SimpleEventHandlerJSX,
  stopAnimationLoop,
  subtract2,
  Surface,
  SurfaceJSX,
  TextureJSX,
  type TextureOptions,
  TextureSize,
  TrailJSX,
  Transform,
  Vec2,
  vec2,
  type Vec3,
  vec3,
  Vec4,
  View2D,
  View3D,
  ViewJSX,
} from "../../src";
import { ColorBufferJSX } from "../../src/base-surfaces/react-surface/resource/color-buffer-jsx.js";
import { InstanceProviderWithList } from "../../src/instance-provider/instance-provider-with-list.js";
import { CubeInstance } from "./layers/cube/cube-instance.js";
import { CubeLayer } from "./layers/cube/cube-layer.js";

export default {
  title: "Deltav/MultiRenderTarget",
  args: {},
  argTypes: {},
};

export const Simple_Trail: StoryFn = (() => {
  const circleProvider = React.useRef(
    new InstanceProviderWithList<CircleInstance>()
  );
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());
  const mouse = React.useRef(vec2(0, 0));
  const animationDuration = 1000;

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      if (!circleProvider.current) return;
      const surface = await ready.current.promise;
      const provider = circleProvider.current;
      const view = surface.getViewSize("particles.main");
      const project = surface.getProjections("particles.main");

      if (!view || !project) {
        console.warn("Invalid View Size", surface);
        return;
      }

      mouse.current = scale2(view.mid, 1 / window.devicePixelRatio);

      provider.add(
        new CircleInstance({
          radius: 20,
          center: mouse.current,
          color: [0.4, 0.7, 1.0, 1.0],
        })
      );
    },
  });

  const handleMouseMove = (e: IMouseInteraction) => {
    if (!circleProvider.current) return;
    const world = e.target.view.projection.screenToWorld(e.screen.position);
    mouse.current = vec2(world);

    circleProvider.current.instances.forEach((circle) => {
      circle.center = mouse.current;
    });
  };

  const textureSettingsRGBA = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA,
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <SimpleEventHandlerJSX handlers={{ handleMouseMove }} />
      <TextureJSX
        name="color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsRGBA}
      />
      <TextureJSX
        name="trail"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsRGBA}
      />
      <TextureJSX
        name="trailing"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsRGBA}
      />
      <SceneJSX name="particles">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            background: [0, 0, 0, 0],
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: {
              [FragmentOutputType.COLOR]: "color",
            },
            depth: true,
          }}
        />
        <LayerJSX
          name="circles"
          type={CircleLayer}
          providerRef={circleProvider}
          config={{
            animate: {
              radius: AutoEasingMethod.linear(animationDuration),
              color: AutoEasingMethod.easeOutCubic(animationDuration),
            },
          }}
        />
      </SceneJSX>
      {TrailJSX({
        name: "trail",
        intensity: 0.93,
        input: {
          trail: "trail",
          add: "color",
        },
        output: "trailing",
        drift: {
          direction: [0, 0],
        },
      })}
      {DrawJSX({
        name: "draw",
        input: "trailing",
        view: {
          config: {
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
      })}
    </SurfaceJSX>
  );
}).bind({});

export const Glowing_Trail: StoryFn = (() => {
  const circleProvider = React.useRef(
    new InstanceProviderWithList<CircleInstance>()
  );
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());
  const mouse = React.useRef(vec2(0, 0));
  const animationDuration = 1000;

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      if (!circleProvider.current) return;
      const surface = await ready.current.promise;
      const provider = circleProvider.current;
      const view = surface.getViewSize("particles.main");
      const project = surface.getProjections("particles.main");

      if (!view || !project) {
        console.warn("Invalid View Size", surface);
        return;
      }

      mouse.current = scale2(view.mid, 1 / window.devicePixelRatio);

      onAnimationLoop(() => {
        const circles: CircleInstance[] = [];

        for (let i = 0, iMax = 10; i < iMax; ++i) {
          circles.push(
            provider.add(
              new CircleInstance({
                radius: 20,
                center: add2(
                  mouse.current,
                  scale2(
                    normalize2([Math.random() - 0.5, Math.random() - 0.5]),
                    Math.random() * 30
                  )
                ),
                color: [0.4, 0.7, 1.0, 1.0],
              })
            )
          );
        }

        onFrame(() => {
          circles.forEach((circle) => {
            circle.radius = 0;
            circle.color = multiply4(circle.color, [1, 1, 1, 0]);
          });
        }, 1);

        onFrame(() => {
          circles.forEach((circle) => {
            provider.remove(circle);
          });
        }, animationDuration);
      });
    },
  });

  const handleMouseMove = (e: IMouseInteraction) => {
    if (!circleProvider.current) return;
    const world = e.target.view.projection.screenToWorld(e.screen.position);
    const delta = subtract2(world, mouse.current);
    mouse.current = vec2(world);

    circleProvider.current.instances.forEach((circle) => {
      circle.center = add2(circle.center, delta);
    });
  };

  const textureSettings = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB,
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <SimpleEventHandlerJSX handlers={{ handleMouseMove }} />
      <TextureJSX
        name="color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettings}
      />
      <TextureJSX
        name="buffer"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettings}
      />
      <TextureJSX
        name="glow"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <TextureJSX
        name="glowTrail"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <TextureJSX
        name="glowingTrail"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      {[
        TextureSize.SCREEN_HALF,
        TextureSize.SCREEN_QUARTER,
        TextureSize.SCREEN_8TH,
        TextureSize.SCREEN_16TH,
        TextureSize.SCREEN_32ND,
        TextureSize.SCREEN_64TH,
        TextureSize.SCREEN_128TH,
        TextureSize.SCREEN_256TH,
      ].map((size, i) => (
        <TextureJSX
          key={i}
          name={`blur${i + 1}`}
          width={size}
          height={size}
          textureSettings={textureSettings}
        />
      ))}
      <SceneJSX name="particles">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: {
              [FragmentOutputType.COLOR]: "color",
              [FragmentOutputType.GLOW]: "glow",
            },
            depth: true,
          }}
        />
        <LayerJSX
          name="circles"
          type={CircleLayer}
          providerRef={circleProvider}
          config={{
            animate: {
              radius: AutoEasingMethod.linear(animationDuration),
              color: AutoEasingMethod.easeOutCubic(animationDuration),
            },
          }}
        />
      </SceneJSX>
      {TrailJSX({
        name: "trail",
        intensity: 0.93,
        input: {
          trail: "glowTrail",
          add: "glow",
        },
        output: "glowingTrail",
        drift: {
          direction: [-2, -10],
        },
      })}
      {BloomJSX({
        name: "bloom",
        view: {
          config: {
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        gammaCorrection: 0.4,
        samples: 6,
        resources: [
          "glowingTrail",
          "blur1",
          "blur2",
          "blur3",
          "blur4",
          "blur5",
          "blur6",
          "blur7",
          "blur8",
        ],
        compose: "glow",
      })}
      {/* {DrawJSX({
        name: "draw",
        input: "glowingTrail",
        view: {
          config: {
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
      })} */}
    </SurfaceJSX>
  );
}).bind({});

export const Fireworks: StoryFn = (() => {
  const circleProvider = React.useRef(new InstanceProvider<CircleInstance>());
  const camera = React.useRef(new Camera2D());
  const ready = React.useRef(new PromiseResolver<Surface>());
  const animationDuration = 2000;

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      const surface = await ready.current.promise;
      const provider = circleProvider.current;

      // Move things around by making the core look around
      // Also change the cubes colors randomly for extra disco
      const loopId = onAnimationLoop((_t: number) => {
        const viewSize = surface.getViewSize("particles.main");
        if (!viewSize) {
          console.warn("Invalid View Size", surface);
          return;
        }

        const start: Vec2 = [
          (Math.random() * viewSize.width) / 2,
          (Math.random() * viewSize.height) / 2,
        ];
        const color: Vec4 = [
          Math.random() * 0.7 + 0.1,
          Math.random() * 0.7 + 0.1,
          Math.random() * 0.7 + 0.1,
          1,
        ];
        const instances: CircleInstance[] = [];

        for (let i = 0, iMax = 400; i < iMax; ++i) {
          const circle = provider.add(
            new CircleInstance({
              radius: Math.random() * 4 + 2,
              color,
              center: start,
            })
          );
          instances.push(circle);
        }

        // Move the particles to locations and fade them out
        nextFrame(() => {
          instances.forEach((c) => {
            const dir = normalize2([Math.random() - 0.5, Math.random() - 0.5]);
            c.center = add2(c.center, scale2(dir, Math.random() * 350 + 100));
            // c.color = multiply4(c.color, [1, 1, 1, 0]);
            c.radius = 0;
          });
          EasingUtil.modify(instances, ["center"], (easing) => {
            const delay = (Math.random() * animationDuration) / 10;
            easing.setTiming(delay, animationDuration - delay);
          });
        });

        // Remove all faded out particles
        onFrame(() => {
          instances.forEach((c) => provider.remove(c));
        }, animationDuration);
      }, 100);

      return () => {
        stopAnimationLoop(loopId);
      };
    },
  });

  const textureSettings = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB,
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <TextureJSX
        name="color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettings}
      />
      <TextureJSX
        name="buffer"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettings}
      />
      <TextureJSX
        name="glow"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <TextureJSX
        name="glowTrail"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <TextureJSX
        name="glowingTrail"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      {[
        TextureSize.SCREEN_HALF,
        TextureSize.SCREEN_QUARTER,
        TextureSize.SCREEN_8TH,
        TextureSize.SCREEN_16TH,
        TextureSize.SCREEN_32ND,
        TextureSize.SCREEN_64TH,
        TextureSize.SCREEN_128TH,
        TextureSize.SCREEN_256TH,
      ].map((size, i) => (
        <TextureJSX
          key={i}
          name={`blur${i + 1}`}
          width={size}
          height={size}
          textureSettings={textureSettings}
        />
      ))}
      <SceneJSX name="particles">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: {
              [FragmentOutputType.COLOR]: "color",
              [FragmentOutputType.GLOW]: "glow",
            },
            depth: true,
          }}
        />
        <LayerJSX
          name="circles"
          type={CircleLayer}
          providerRef={circleProvider}
          config={{
            animate: {
              center: AutoEasingMethod.easeOutCubic(animationDuration),
              color: AutoEasingMethod.easeOutCubic(animationDuration),
              radius: AutoEasingMethod.linear(animationDuration * 0.6),
            },
          }}
        />
      </SceneJSX>
      {TrailJSX({
        name: "trail",
        intensity: 0.9,
        input: {
          trail: "glowTrail",
          add: "glow",
        },
        output: "glowingTrail",
      })}
      {BloomJSX({
        name: "bloom",
        view: {
          config: {
            background: [0, 0, 0, 0],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        gammaCorrection: 0.4,
        samples: 6,
        resources: [
          "glowingTrail",
          "blur1",
          "blur2",
          "blur3",
          "blur4",
          "blur5",
          "blur6",
          "blur7",
          "blur8",
        ],
        compose: "color",
      })}
    </SurfaceJSX>
  );
}).bind({});

export const Complex_Scene: StoryFn = (() => {
  const cubesProvider = React.useRef<InstanceProvider<CubeInstance>>(null);
  const noColorProvider = React.useRef<InstanceProvider<CubeInstance>>(null);
  const noGlowProvider = React.useRef<InstanceProvider<CubeInstance>>(null);
  const camera = React.useRef(
    Camera.makePerspective({
      fov: (60 * Math.PI) / 180,
      far: 100000,
    })
  );
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      if (!cubesProvider.current) return;
      if (!noColorProvider.current) return;
      if (!noGlowProvider.current) return;

      camera.current.position = [0, 0, 25 * 2];
      camera.current.lookAt([0, 0, -20], [0, 1, 0]);
      const factor =
        camera.current.projectionType === CameraProjectionType.PERSPECTIVE
          ? 1
          : 100;

      // Make a central cube to parent everything around
      const core1 = cubesProvider.current.add(
        new CubeInstance({
          color: [0, 0, 0, 1],
          size: scale3([1, 1, 1], factor),
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
                1,
              ],
              size: scale3([1, 1, 1], factor),
            });

            c.localPosition = scale3(normalize3(vec3(i, k, z)), 10);
            c.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);

            cubes.push(cubesProvider.current.add(c));
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
                1,
              ],
              size: scale3([1, 1, 1], factor),
            });

            c.localPosition = scale3(normalize3(vec3(i, k, z)), 5);
            c.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);

            cubes.push(noGlowProvider.current.add(c));
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
                1,
              ],
              size: scale3([1, 1, 1], factor),
            });

            c.localPosition = scale3(normalize3(vec3(i, k, z)), 15);
            c.transform.lookAtLocal([0, 0, 0], [0, 1, 0]);

            cubes.push(noColorProvider.current.add(c));
          }
        }
      }

      let change = 0;

      // Move things around by making the core look around
      // Also change the cubes colors randomly for extra disco
      const loopId = onAnimationLoop((_t: number) => {
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
          1,
        ];
      });

      return () => {
        stopAnimationLoop(loopId);
      };
    },
  });

  const textureSettings = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB,
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <TextureJSX
        name="color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettings}
      />
      <TextureJSX
        name="buffer"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettings}
      />
      <TextureJSX
        name="glow"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <TextureJSX
        name="glowTrail"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <TextureJSX
        name="glowingTrail"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      {[
        TextureSize.SCREEN_HALF,
        TextureSize.SCREEN_QUARTER,
        TextureSize.SCREEN_8TH,
        TextureSize.SCREEN_16TH,
        TextureSize.SCREEN_32ND,
        TextureSize.SCREEN_64TH,
        TextureSize.SCREEN_128TH,
        TextureSize.SCREEN_256TH,
      ].map((size, i) => (
        <TextureJSX
          key={i}
          name={`blur${i + 1}`}
          width={size}
          height={size}
          textureSettings={textureSettings}
        />
      ))}
      <SceneJSX name="cubes">
        <ViewJSX
          name="main"
          type={View3D}
          config={{
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: {
              [FragmentOutputType.COLOR]: "color",
              [FragmentOutputType.ACCUMULATION1]: "buffer",
              [FragmentOutputType.GLOW]: "glow",
            },
            depth: true,
          }}
        />
        <LayerJSX
          name="cubes"
          type={CubeLayer}
          providerRef={cubesProvider}
          config={{}}
        />
        <LayerJSX
          name="noColor"
          type={CubeLayer}
          providerRef={noColorProvider}
          config={{
            mapOutput: {
              [FragmentOutputType.COLOR]: FragmentOutputType.ACCUMULATION1,
            },
          }}
        />
        <LayerJSX
          name="noGlow"
          type={CubeLayer}
          providerRef={noGlowProvider}
          config={{
            mapOutput: {
              [FragmentOutputType.GLOW]: FragmentOutputType.NONE,
            },
          }}
        />
      </SceneJSX>
      {TrailJSX({
        name: "trail",
        intensity: 0.9,
        input: {
          trail: "glowTrail",
          add: "glow",
        },
        output: "glowingTrail",
      })}
      {BloomJSX({
        name: "bloom",
        view: {
          config: {
            background: [0, 0, 0, 0],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        samples: 6,
        gammaCorrection: 0.5,
        resources: [
          "glowingTrail",
          "blur1",
          "blur2",
          "blur3",
          "blur4",
          "blur5",
          "blur6",
          "blur7",
          "blur8",
        ],
        compose: "color",
      })}
    </SurfaceJSX>
  );
}).bind({});

export const MSAA_Blit_To_Texture: StoryFn = (() => {
  const cubeProvider = React.useRef(
    new InstanceProviderWithList<CubeInstance>()
  );
  const camera = React.useRef(
    Camera.makePerspective({
      fov: (60 * Math.PI) / 180,
      far: 100000,
    })
  );
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      // Wait for the surface to establish the full pipeline
      if (!cubeProvider.current) return;
      const surface = await ready.current.promise;
      const provider = cubeProvider.current;
      const view = surface.getViewSize("particles.main");
      const project = surface.getProjections("particles.main");

      if (!view || !project) {
        console.warn("Invalid View Size", surface);
        return;
      }

      camera.current.position = [0, 0, -100];
      camera.current.lookAt([0, 0, 0], [0, 0, -1]);

      const cube = provider.add(
        new CubeInstance({
          color: [0.4, 0.7, 1.0, 1.0],
          size: [10, 10, 10],
        })
      );

      const loopId = onAnimationLoop((t) => {
        cube.transform.localRotation = fromEulerAxisAngleToQuat(
          [0, 1, 1],
          t * 0.001
        );
      });

      return () => {
        stopAnimationLoop(loopId);
      };
    },
  });

  const textureSettingsRGBA = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA,
  };

  const textureSettingsDepth: TextureOptions = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.DepthComponent,
    internalFormat: GLSettings.Texture.TexelDataType.DEPTH_COMPONENT24,
    type: GLSettings.Texture.SourcePixelFormat.UnsignedInt,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  };

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      <ColorBufferJSX
        name="color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA8,
          multiSample: 2,
        }}
      />
      <ColorBufferJSX
        name="glow"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA8,
          multiSample: 2,
        }}
      />
      <DepthBufferJSX
        name="depth"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat:
            GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT24,
          multiSample: 2,
        }}
      />
      <TextureJSX
        name="blit-color"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsRGBA}
      />
      <TextureJSX
        name="blit-glow"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsRGBA}
      />
      <TextureJSX
        name="blit-depth"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsDepth}
      />
      <SceneJSX name="particles">
        <ViewJSX
          name="main"
          type={View3D}
          config={{
            background: [0, 0, 0, 0],
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: {
              [FragmentOutputType.COLOR]: "color",
              [FragmentOutputType.GLOW]: "glow",
            },
            depth: "depth",
            blit: {
              color: {
                [FragmentOutputType.COLOR]: "blit-color",
                [FragmentOutputType.GLOW]: "blit-glow",
              },
              depth: "blit-depth",
            },
          }}
        />
        <LayerJSX
          name="cubes"
          type={CubeLayer}
          providerRef={cubeProvider}
          config={{}}
        />
      </SceneJSX>
      {DrawJSX({
        name: "draw-color",
        input: "blit-color",
        view: {
          config: {
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
      })}
      {DrawJSX({
        name: "draw-glow",
        input: "blit-glow",
        view: {
          config: {
            viewport: {
              left: "10%",
              bottom: "10%",
              width: "20%",
              height: "20%",
            },
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
      })}
      {PostProcessJSX({
        name: "draw-depth",
        buffers: {
          tex: "blit-depth",
        },
        view: {
          config: {
            viewport: {
              right: "10%",
              bottom: "10%",
              width: "20%",
              height: "20%",
            },
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        shader: `
        void main() {
          // 1) Sample raw depth
          float z = texture2D(tex, texCoord).r;

          // 2) Optional: linearize if you want (optional)
          // z = (2.0 * near) / (far + near - z * (far - near));

          // 3) Nonlinear boost for near contrast
          float d = pow(z, 20.0);

          // 4) Fake fancy color: purple -> pink -> orange -> yellow
          vec3 color = vec3(0.0);
          if (d < 0.5) {
            color = mix(vec3(0.2, 0.0, 0.5), vec3(1.0, 0.0, 0.5), d * 2.0);
          } else {
            color = mix(vec3(1.0, 0.0, 0.5), vec3(1.0, 1.0, 0.0), (d - 0.5) * 2.0);
          }

          $\{out: fragColor} = vec4(color, 1.0);
        }
        `,
      })}
    </SurfaceJSX>
  );
}).bind({});

/**
 * An implementation of the blog post described at this link:
 * By Morgan McGuire
 * https://casual-effects.blogspot.com/2015/03/colored-blended-order-independent.html
 */
export const MSAA_FastColoredTransparency: StoryFn = (() => {
  const cubeProvider = React.useRef(
    new InstanceProviderWithList<CubeInstance>()
  );
  const camera = React.useRef(
    Camera.makePerspective({
      fov: (60 * Math.PI) / 180,
      far: 100000,
    })
  );
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      if (!cubeProvider.current) return;
      const provider = cubeProvider.current;

      camera.current.position = [0, 0, -150];
      camera.current.lookAt([0, 0, 0], [0, 0, -1]);

      // Create multiple semi-transparent cubes
      const colors: Vec4[] = [
        [1.0, 0.3, 0.3, 0.9999],
        [0.3, 1.0, 0.3, 0.6],
        [0.3, 0.3, 1.0, 0.9],
      ];

      const offsets: Vec3[] = [
        [-20, 0, 0],
        [20, 0, 0],
        [0, 0, 20],
      ];

      const cubes = colors.map((color, i) => {
        const cube = provider.add(
          new CubeInstance({
            color: color,
            glow: [1.0, 1.0, 1.0, 1.0],
            size: [20, 20, 20],
          })
        );
        cube.transform.position = offsets[i];
        return cube;
      });

      const loopId = onAnimationLoop((t) => {
        cubes.forEach((cube, i) => {
          cube.transform.localRotation = fromEulerAxisAngleToQuat(
            [0, 1, i + 1],
            t * 0.001
          );
        });
      });

      return () => {
        stopAnimationLoop(loopId);
      };
    },
  });

  // Texture configs
  const textureSettingsAccum = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGBA,
    internalFormat: GLSettings.Texture.TexelDataType.RGBA16F,
    type: GLSettings.Texture.SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  };

  const textureSettingsRevealage: TextureOptions = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RED,
    internalFormat: GLSettings.Texture.TexelDataType.R16F,
    type: GLSettings.Texture.SourcePixelFormat.HalfFloat,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  };

  const textureSettingsRGBA: TextureOptions = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.RGB,
    internalFormat: GLSettings.Texture.TexelDataType.RGB,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  };

  const textureSettingsDepth: TextureOptions = {
    generateMipMaps: false,
    format: GLSettings.Texture.TexelDataType.DepthComponent,
    internalFormat: GLSettings.Texture.TexelDataType.DEPTH_COMPONENT24,
    type: GLSettings.Texture.SourcePixelFormat.UnsignedInt,
    minFilter: GLSettings.Texture.TextureMinFilter.Nearest,
    magFilter: GLSettings.Texture.TextureMagFilter.Nearest,
  };

  const resources = (
    <>
      {/* MSAA Enabled color buffers */}
      <ColorBufferJSX
        name="opaque"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGB8,
          multiSample: 2,
        }}
      />
      <DepthBufferJSX
        name="opaque-depth"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat:
            GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT24,
          multiSample: 2,
        }}
      />
      <ColorBufferJSX
        name="accumulation"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA16F,
          multiSample: 2,
        }}
      />
      <ColorBufferJSX
        name="revealage"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.R16F,
          multiSample: 2,
        }}
      />

      {/* Transparent accum buffers */}
      <TextureJSX
        name="opaque-blit"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsRGBA}
      />
      <TextureJSX
        name="accum-blit"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsAccum}
      />
      <TextureJSX
        name="revealage-blit"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsRevealage}
      />
      <TextureJSX
        name="depth-blit"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={textureSettingsDepth}
      />
    </>
  );

  const drawResources = (
    <>
      {DrawJSX({
        name: "draw-opaque",
        input: "opaque-blit",
        view: {
          config: {
            viewport: {
              left: "10%",
              bottom: "10%",
              width: "20%",
              height: "20%",
            },
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
      })}

      {DrawJSX({
        name: "draw-revealage",
        input: "revealage-blit",
        view: {
          config: {
            viewport: {
              top: "10%",
              left: "10%",
              width: "20%",
              height: "20%",
            },
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
      })}

      {PostProcessJSX({
        name: "draw-depth",
        buffers: {
          tex: "depth-blit",
        },
        view: {
          config: {
            viewport: {
              right: "10%",
              bottom: "10%",
              width: "20%",
              height: "20%",
            },
            background: [0.1, 0.1, 0.1, 1],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        shader: `
        void main() {
          // 1) Sample raw depth
          float z = texture2D(tex, texCoord).r;

          // 2) Optional: linearize if you want (optional)
          // z = (2.0 * near) / (far + near - z * (far - near));

          // 3) Nonlinear boost for near contrast
          float d = pow(z, 30.0);

          // 4) Fake fancy color: purple -> pink -> orange -> yellow
          vec3 color = vec3(0.0);
          if (d < 0.5) {
            color = mix(vec3(0.2, 0.0, 0.5), vec3(1.0, 0.0, 0.5), d * 2.0);
          } else {
            color = mix(vec3(1.0, 0.0, 0.5), vec3(1.0, 1.0, 0.0), (d - 0.5) * 2.0);
          }

          $\{out: fragColor} = vec4(color, 1.0);
        }
        `,
      })}
    </>
  );

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{
        alpha: true,
        antialias: true,
      }}
    >
      {resources}

      {/* === Transparent pass === */}
      <SceneJSX name="transparentPass">
        <ViewJSX
          name="opaque"
          type={View3D}
          config={{
            background: [0, 0, 0, 0],
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            materialSettings: {
              depthWrite: true,
              depthTest: true,
            },
          }}
          output={{
            buffers: {
              [FragmentOutputType.OPAQUE]: "opaque",
            },
            depth: "opaque-depth",
            blit: {
              color: {
                [FragmentOutputType.OPAQUE]: "opaque-blit",
              },
              // depth: "depth-blit",
            },
          }}
        />
        <ViewJSX
          name="alpha-accumulation"
          type={View3D}
          config={{
            background: [0, 0, 0, 0],
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR],
            materialSettings: {
              blending: {
                blendEquation: GLSettings.Material.BlendingEquations.Add,
                blendSrc: GLSettings.Material.BlendingSrcFactor.One,
                blendDst: GLSettings.Material.BlendingDstFactor.One,
              },
              depthFunc: GLSettings.Material.DepthFunctions.LESS,
              depthWrite: false,
              depthTest: true,
            },
          }}
          output={{
            buffers: {
              [FragmentOutputType.ACCUMULATION1]: "accumulation",
              [FragmentOutputType.COEFFICIENT1]: "revealage",
            },
            depth: "opaque-depth",
            blit: {
              color: {
                [FragmentOutputType.ACCUMULATION1]: "accum-blit",
                [FragmentOutputType.COEFFICIENT1]: "revealage-blit",
              },
              depth: "depth-blit",
            },
          }}
        />
        <LayerJSX
          name="transparent-cubes"
          type={CubeLayer}
          providerRef={cubeProvider}
          config={{
            fs: [
              {
                outputType: FragmentOutputType.ACCUMULATION1,
                source: `
                  void main() {
                    float depthWeight = mix(10.0, 1.0, _depth);
                    float weight = color.a;
                    float depthWeightedColor = pow(weight, depthWeight);
                    $\{out: colorAccum} = vec4(color.rgb * weight, weight);
                  }
                `,
              },
              {
                outputType: FragmentOutputType.COEFFICIENT1,
                source: `
                  void main() {
                    $\{out: revealage} = vec4(1.0 - weight);
                  }
                `,
              },
              {
                outputType: FragmentOutputType.OPAQUE,
                source: `
                  void main() {
                    if (color.a < 1.0) discard;
                    $\{out: opaqueColor} = vec4(color.rgb, 1.0);
                  }
                `,
              },
            ],
          }}
        />
      </SceneJSX>

      {/* === Final Composite === */}
      {PostProcessJSX({
        name: "wboitComposite",
        buffers: {
          accum: "accum-blit",
          revealage: "revealage-blit",
          opaque: "opaque-blit",
        },
        view: {
          config: {
            background: [0, 0, 0, 1],
            clearFlags: [ClearFlags.COLOR],
          },
        },
        shader: `
          void main() {
            vec3 opaqueColor = texture(opaque, texCoord).rgb;
            vec4 sumOfColors = texture(accum, texCoord);
            float sumOfWeights = sumOfColors.a;

            if (sumOfWeights < 0.0001) {
              $\{out: fragColor} = vec4(opaqueColor, 1.0);
              return;
            }

            float alpha = 1.0 - texture(revealage, texCoord).r;
            opaqueColor = mix(opaqueColor, sumOfColors.rgb / sumOfWeights, alpha);
            // opaqueColor = sumOfColors.rgb / sumOfWeights * alpha + opaqueColor * (1.0 - alpha);

            _FragColor = vec4(opaqueColor, 1.0);
          }
        `,
      })}

      {drawResources}
    </SurfaceJSX>
  );
}).bind({});
