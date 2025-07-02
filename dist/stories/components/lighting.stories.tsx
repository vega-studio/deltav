import { StoryFn } from "@storybook/react";
import React from "react";

import { useLifecycle } from "../../../util/hooks/use-life-cycle.js";
import {
  Camera,
  ClearFlags,
  CommonTextureOptions,
  createUniform,
  DrawJSX,
  FragmentOutputType,
  fromEulerAxisAngleToQuat,
  GLSettings,
  LayerJSX,
  onAnimationLoop,
  PostProcessJSX,
  PromiseResolver,
  SceneJSX,
  ShaderInjectionTarget,
  stopAnimationLoop,
  Surface,
  SurfaceJSX,
  TextureJSX,
  TextureSize,
  Transform,
  UniformSize,
  View3D,
  ViewJSX,
} from "../../src";
import { ColorBufferJSX } from "../../src/base-surfaces/react-surface/resource/color-buffer-jsx.js";
import { DepthBufferJSX } from "../../src/base-surfaces/react-surface/resource/depth-buffer-jsx.js";
import { InstanceProviderWithList } from "../../src/instance-provider/instance-provider-with-list.js";
import { CubeInstance } from "./layers/cube/cube-instance.js";
import { CubeLightingLayer } from "./layers/cube-lighting/cube-lighting-layer.js";

export default {
  title: "Deltav/Lighting",
  args: {},
  argTypes: {},
};

export const DeferredLightingWithShadow: StoryFn = (() => {
  const cubeProvider = React.useRef(
    new InstanceProviderWithList<CubeInstance>()
  );
  const camera = React.useRef(
    Camera.makePerspective({ fov: Math.PI / 3, near: 10, far: 60 })
  );
  const lightCamera = React.useRef(
    Camera.makeOrthographic({
      left: -20,
      right: 20,
      bottom: -20,
      top: 20,
      // fov: Math.PI / 2,
      near: 1,
      far: 50,
    })
  );
  const ready = React.useRef(new PromiseResolver<Surface>());

  useLifecycle({
    async didMount() {
      const provider = cubeProvider.current!;
      camera.current.position = [0, 20, -35];
      camera.current.lookAt([0, 0, 0], [0, 1, 0]);

      lightCamera.current.position = [0, 15, 0];
      lightCamera.current.lookAt([0, 0, 0], [0, 1, 0]);

      const cubes = Array.from({ length: 10 }, (_, i) => {
        const size = 0.5 + (i % 2 === 0 ? 0 : 0.3); // Non-random sizes: 30 or 50
        return provider.add(
          new CubeInstance({
            color: [Math.random(), Math.random(), Math.random(), 1], // Random color
            size: [size, size, size],
            transform: new Transform().setLocalPosition([
              (i % 5) * 2 - 5, // Non-random x position between -50 and 50
              Math.floor(i / 5) * 2 + 3, // Non-random y position between -50 and 50
              (i % 3) * 2 - 3, // Non-random z position between -30 and 30
            ]),
          })
        );
      });

      // Add a floor
      provider.add(
        new CubeInstance({
          transform: new Transform()
            .setLocalPosition([0, -10, 0])
            .setLocalRotation(fromEulerAxisAngleToQuat([1, 0, 0], Math.PI / 2)),
          color: [0.8, 0.8, 0.8, 1],
          size: [10, 5, 10],
        })
      );

      // const mainCameraFrustum = frustumCornersFromInvViewProjection(
      //   camera.current.inverseViewProjection
      // );

      // console.log(mainCameraFrustum);

      const loopId = onAnimationLoop((t) => {
        cubes.forEach((cube, index) => {
          cube.transform.localRotation = fromEulerAxisAngleToQuat(
            [0, 1, 1],
            t * (0.001 + (index + 1) * 0.0001) // Different speed for each cube
          );
        });

        lightCamera.current.position = [
          15 * Math.sin(t * 0.002),
          15,
          15 * Math.cos(t * 0.002),
        ];

        lightCamera.current.lookAt([0, 0, 0], [0, 1, 0]);

        // camera.current.position = [
        //   15 * Math.sin(t * 0.002),
        //   15,
        //   15 * Math.cos(t * 0.002),
        // ];

        // camera.current.lookAt([0, 0, 0], [0, 1, 0]);

        // // Get the eight points representing the main camera's frustum
        // const mainCameraFrustum = frustumCornersFromInvViewProjection(
        //   camera.current.inverseViewProjection
        // );

        // // Fit the light camera's projection to the main camera's frustum
        // lightCamera.current.fitProjectionToPoints(mainCameraFrustum);
      });

      return () => stopAnimationLoop(loopId);
    },
  });

  // === RESOURCES ===
  const resources = (
    <>
      {/* G-Buffers */}
      <ColorBufferJSX
        name="gbuffer0"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA16F,
          multiSample: 2,
        }}
      />
      <ColorBufferJSX
        name="gbuffer1"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA16F,
          multiSample: 2,
        }}
      />
      <DepthBufferJSX
        name="gbuffer-depth"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        config={{
          internalFormat:
            GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT24,
          multiSample: 2,
        }}
      />

      {/* Blit textures */}
      <TextureJSX
        name="gbuffer0-blit"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={CommonTextureOptions.RGBA16F()}
      />
      <TextureJSX
        name="gbuffer1-blit"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={CommonTextureOptions.RGBA16F()}
      />
      <TextureJSX
        name="gbuffer-depth-blit"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={CommonTextureOptions.DEPTH_COMPONENT24()}
      />

      {/* Shadow map */}
      <TextureJSX
        name="shadow-map"
        width={2048}
        height={2048}
        textureSettings={CommonTextureOptions.RG32F()}
      />
      <TextureJSX
        name="shadow-map-blur"
        width={2048}
        height={2048}
        textureSettings={CommonTextureOptions.RG32F()}
      />

      {/* Deferred lighting result */}
      <TextureJSX
        name="deferred-lighting"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={CommonTextureOptions.RGBA()}
      />
      <TextureJSX
        name="deferred-lighting-debug1"
        width={TextureSize.SCREEN}
        height={TextureSize.SCREEN}
        textureSettings={CommonTextureOptions.RGBA()}
      />
    </>
  );

  const deferredLight = PostProcessJSX({
    name: "deferredLight",
    buffers: {
      gbuffer0: "gbuffer0-blit",
      gbuffer1: "gbuffer1-blit",
      gbufferPosition: "gbuffer-position-blit",
      depth: "gbuffer-depth-blit",
      shadowMap: "shadow-map",
    },
    output: {
      buffers: {
        [FragmentOutputType.COLOR]: "deferred-lighting",
        [FragmentOutputType.COLOR2]: "deferred-lighting-debug1",
      },
      depth: false,
    },
    uniforms: [
      createUniform({
        name: "lightPos",
        shaderInjection: ShaderInjectionTarget.ALL,
        size: UniformSize.THREE,
        update: () => {
          return lightCamera.current.position;
        },
      }),
      createUniform({
        name: "lightViewProj",
        shaderInjection: ShaderInjectionTarget.ALL,
        size: UniformSize.MATRIX4,
        update: () => {
          return lightCamera.current.viewProjection;
        },
      }),
      createUniform({
        name: "invViewProj",
        shaderInjection: ShaderInjectionTarget.ALL,
        size: UniformSize.MATRIX4,
        update: () => {
          return camera.current.inverseViewProjection;
        },
      }),
      createUniform({
        name: "near",
        shaderInjection: ShaderInjectionTarget.ALL,
        size: UniformSize.ONE,
        update: () => {
          return camera.current.projectionOptions.near;
        },
      }),
      createUniform({
        name: "far",
        shaderInjection: ShaderInjectionTarget.ALL,
        size: UniformSize.ONE,
        update: () => {
          return camera.current.projectionOptions.far;
        },
      }),
    ],
    shader: [
      {
        outputType: FragmentOutputType.COLOR,
        source: `
          const float g_MinVariance = 0.0000001;

          float unpackDepth(sampler2D tex, vec2 uv) {
            return texture(tex, uv).r;
          }

          vec3 reconstructWorldPosition(vec2 uv, float depth) {
            vec4 ndc = vec4(uv * 2.0 - 1.0, depth, 1.0);
            vec4 worldPos = invViewProj * ndc;
            return worldPos.xyz / worldPos.w;
          }

          float chebyshevUpperBound(vec2 moments, float t) {
            // One-tailed inequality valid if t > moments.x
            float p = step(t, moments.x);
            // Compute variance.
            float variance = moments.y - (moments.x * moments.x);
            variance = max(variance, g_MinVariance);
            // Compute probabilistic upper bound.
            float d = t - moments.x;
            float pMax = variance / (variance + d * d);
            return max(p, pMax);
          }

          float shadowContribution(vec2 lightTexCoord, float distanceToLight) {
            // Read the moments from the variance shadow map.
            vec2 moments = texture(shadowMap, lightTexCoord).xy;
            // Compute the Chebyshev upper bound.
            return chebyshevUpperBound(moments, distanceToLight);
          }

          void main() {
            vec4 gbufferSample = texture(gbuffer0, texCoord);
            vec3 albedo = gbufferSample.rgb;
            float roughness = gbufferSample.a;
            vec3 normal = normalize(texture(gbuffer1, texCoord).rgb * 2.0 - 1.0);

            // We use a non-linear depth buffer, so we need to convert it to a linear depth
            float depth = texture(depth, texCoord).r; // depth ∈ [0, 1]
            float ndcZ = depth * 2.0 - 1.0;

            // Calculate model lighting
            vec3 position = reconstructWorldPosition(texCoord, ndcZ);
            // vec3 position = texture(gbufferPosition, texCoord).rgb;
            vec3 L = normalize(lightPos - position);
            vec3 V = normalize(-position); // Note: view vector in world space
            float NdotL = max(dot(normal, L), 0.0);

            // Calculate shadows cast across models
            vec4 lightSpace = lightViewProj * vec4(position, 1.0);

            vec3 proj = lightSpace.xyz / lightSpace.w;
            vec3 uvz = proj.xyz * 0.5 + 0.5;
            float shadow = 1.0;

            if (proj.x < -1.0 || proj.x > 1.0 || proj.y < -1.0 || proj.y > 1.0 || proj.z < -1.0 || proj.z > 1.0) {
              shadow = 1.0; // No shadow outside light frustum
            } else {
              shadow = shadowContribution(uvz.xy, uvz.z);
            }

            // Compositing
            vec3 color = albedo * mix(0.2, 1.0, NdotL * shadow);
            // vec3 color = albedo * NdotL;

            $\{out: fragColor} = vec4(color, 1.0);
          }
        `,
      },
      {
        outputType: FragmentOutputType.COLOR2,
        source: `
          void main() {
            // float testShadow = current > closest + 0.01 ? 0.0 : 1.0;
            $\{out: lightSpaceOut} = vec4(uvz.xy, pow(uvz.z, 3000.0), 1.0);
          }
        `,
      },
    ],
  });

  // === DRAW ===

  return (
    <SurfaceJSX
      ready={ready.current}
      options={{ alpha: true, antialias: true }}
    >
      {resources}

      {/* === PASSES === */}
      <SceneJSX name="shadowScene">
        <ViewJSX
          name="gbuffer-pass"
          type={View3D}
          config={{
            camera: camera.current,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            materialSettings: {
              depthTest: true,
              depthFunc: GLSettings.Material.DepthFunctions.LESS,
              depthWrite: true,
              blending: null,
            },
          }}
          output={{
            buffers: {
              [FragmentOutputType.COLOR]: "gbuffer0",
              [FragmentOutputType.NORMAL]: "gbuffer1",
            },
            depth: "gbuffer-depth",
            blit: {
              color: {
                [FragmentOutputType.COLOR]: "gbuffer0-blit",
                [FragmentOutputType.NORMAL]: "gbuffer1-blit",
              },
              depth: "gbuffer-depth-blit",
            },
          }}
        />
        <ViewJSX
          name="shadow-pass"
          type={View3D}
          config={{
            camera: lightCamera.current,
            preventCameraAdjustment: true,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            materialSettings: {
              depthTest: true,
              depthFunc: GLSettings.Material.DepthFunctions.LESS,
              depthWrite: true,
              blending: null,
            },
          }}
          output={{
            buffers: {
              [FragmentOutputType.MOMENTS]: "shadow-map",
            },
            depth: true,
          }}
        />
        <LayerJSX
          name="cubes"
          type={CubeLightingLayer}
          providerRef={cubeProvider}
          config={{}}
        />
      </SceneJSX>
      {deferredLight}

      {DrawJSX({
        name: "deferred-lighting-out",
        input: "deferred-lighting",
      })}

      {/* === OPTIONAL DEBUG === */}
      {/* {DrawDebugJSX({
        inputs: [
          "gbuffer0-blit",
          "gbuffer1-blit",
          "gbuffer-position-blit",
          { key: "gbuffer-depth-blit", depth: true },
          { key: "shadow-map" },
          { key: "deferred-lighting-debug1", channels: ["r", "g", "b"] },
        ],
        background: [0.1, 0.1, 0.1, 1],
      })} */}
    </SurfaceJSX>
  );
}).bind({});
