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
  TextureSize,
  TrailJSX,
  Transform,
  Vec2,
  vec2,
  vec3,
  Vec4,
  View2D,
  View3D,
  ViewJSX,
} from "../../src";
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
