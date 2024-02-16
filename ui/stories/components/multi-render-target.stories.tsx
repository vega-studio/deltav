import React from "react";
import { StoryFn } from "@storybook/react";
import { SurfaceJSX } from "../../src/base-surfaces/react-surface/surface-jsx";
import {
  Camera,
  CameraProjectionType,
  ClearFlags,
  FragmentOutputType,
  GLSettings,
  InstanceProvider,
  PromiseResolver,
  SceneJSX,
  Surface,
  TextureJSX,
  TextureSize,
  Transform,
  View3D,
  fromEulerAxisAngleToQuat,
  normalize3,
  onAnimationLoop,
  scale3,
  stopAnimationLoop,
  vec3,
} from "../../src";
import { LayerJSX } from "../../src/base-surfaces/react-surface/scene/layer-jsx";
import { ViewJSX } from "../../src/base-surfaces/react-surface/scene/view-jsx";
import { useLifecycle } from "../../../util/hooks/use-life-cycle";
import { BloomJSX } from "../../src/base-surfaces/react-surface/processing/bloom/bloom-jsx";
import { CubeLayer } from "./layers/cube/cube-layer";
import { CubeInstance } from "./layers/cube/cube-instance";

export default {
  title: "Deltav/MultiRenderTarget",
  args: {},
  argTypes: {},
};

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

      camera.current.position = [0, 0, 25];
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
        <LayerJSX name="cubes" type={CubeLayer} providerRef={cubesProvider} />
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
      {BloomJSX({
        name: "bloom",
        view: {
          config: {
            background: [0, 0, 0, 0],
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          },
        },
        samples: 6,
        resources: [
          "glow",
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
