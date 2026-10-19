import React from "react";

import {
  CircleInstance,
  CircleLayer,
  FragmentOutputType,
  InstanceProvider,
  LayerJSX,
  PostProcessJSX,
  SceneJSX,
  TextureJSX,
  TrailJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { type RGBA01, rgbaTextureSettings, useViewConfig } from "./common.js";

export interface ITrailFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Centre of the circle at step 0, world units */
  start: [number, number];
  /** How far the circle moves per step, world units */
  stride: [number, number];
  /** The circle's current step; an update moves it */
  step: number;
  radius: number;
  color: RGBA01;
  /** TrailJSX intensity: the factor the trail keeps per frame */
  intensity: number;
}

/**
 * A CircleLayer circle is drawn into texture "add" (cleared to transparent
 * every frame) at `start + step * stride`. TrailJSX composites "add" over the
 * faded "trail" into "out" and writes `out * intensity` back to "trail". A
 * last pass draws "out" to the screen as `rgb * a` over opaque black, so a
 * fading trail reads as decreasing brightness.
 */
const TrailFixture: React.FC<ITrailFixture> = (props) => {
  const { width, height, clear } = props;
  const config = useViewConfig([0, 0, 0, 0]);
  const circle = React.useRef<CircleInstance | null>(null);
  const provider = React.useRef<InstanceProvider<CircleInstance> | null>(null);
  const center: [number, number] = [
    props.start[0] + props.step * props.stride[0],
    props.start[1] + props.step * props.stride[1],
  ];

  if (!provider.current) {
    provider.current = new InstanceProvider<CircleInstance>();
    circle.current = provider.current.add(
      new CircleInstance({
        center,
        radius: props.radius,
        color: props.color,
      })
    );
  }
  circle.current!.center = center;

  return (
    <TestSurface width={width} height={height} clear={clear}>
      {["add", "trail", "out"].map((name) => (
        <TextureJSX
          key={name}
          name={name}
          width={width}
          height={height}
          textureSettings={rgbaTextureSettings("nearest")}
        />
      ))}
      <SceneJSX name="moving">
        <ViewJSX
          name="main"
          type={View2D}
          config={config}
          output={{
            buffers: { [FragmentOutputType.COLOR]: "add" },
            depth: false,
          }}
        />
        <LayerJSX
          name="circle"
          type={CircleLayer}
          providerRef={provider}
          config={{}}
        />
      </SceneJSX>
      {TrailJSX({
        name: "fade",
        input: { trail: "trail", add: "add" },
        output: "out",
        intensity: props.intensity,
      })}
      {PostProcessJSX({
        name: "present",
        buffers: { tex: "out" },
        material: { blending: null },
        shader: `
          void main() {
            vec4 t = texture(tex, texCoord);
            $\{out: color} = vec4(t.rgb * t.a, 1.0);
          }
        `,
      })}
    </TestSurface>
  );
};

registerFixture("resources/trail", TrailFixture);
