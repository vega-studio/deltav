import React from "react";

import {
  Camera2D,
  CircleInstance,
  CircleLayer,
  ClearFlags,
  ColorBufferJSX,
  DepthBufferJSX,
  DrawJSX,
  FragmentOutputType,
  GLSettings,
  InstanceProvider,
  LayerJSX,
  SceneJSX,
  TextureJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { type RGBA01, rgbaTextureSettings } from "./common.js";

/** One circle, drawn by a CircleLayer of its own (layers draw in order). */
export interface ITargetCircle {
  /** Centre, world units */
  center: [number, number];
  radius: number;
  color: RGBA01;
  /** CircleInstance depth: a larger value is nearer the View2D camera */
  depth: number;
}

export interface ICircleTargetFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Control2D offset of the offscreen view's camera, world units */
  offset: [number, number];
  circles: ITargetCircle[];
  /** Attach a DepthBufferJSX depth renderbuffer to the offscreen view */
  depth: boolean;
}

/**
 * An offscreen View2D renders its circles into a ColorBufferJSX colour
 * renderbuffer (with a DepthBufferJSX depth renderbuffer when `depth`), blits
 * it into a TextureJSX of the canvas size, and DrawJSX draws that texture to
 * the screen as a full-screen quad.
 */
const CircleTargetFixture: React.FC<ICircleTargetFixture> = (props) => {
  const { width, height } = props;
  const camera = React.useRef(
    new Camera2D({ offset: [props.offset[0], props.offset[1], 0] })
  );
  const providers = React.useRef<
    { current: InstanceProvider<CircleInstance> }[] | null
  >(null);

  if (!providers.current) {
    providers.current = props.circles.map((circle) => {
      const provider = new InstanceProvider<CircleInstance>();
      provider.add(
        new CircleInstance({
          center: circle.center,
          radius: circle.radius,
          color: circle.color,
          depth: circle.depth,
        })
      );
      return { current: provider };
    });
  }

  return (
    <TestSurface width={width} height={height} clear={props.clear}>
      <ColorBufferJSX
        name="color"
        width={width}
        height={height}
        config={{
          internalFormat: GLSettings.RenderTarget.ColorBufferFormat.RGBA8,
        }}
      />
      {props.depth ? (
        <DepthBufferJSX
          name="depth"
          width={width}
          height={height}
          config={{
            internalFormat:
              GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16,
          }}
        />
      ) : null}
      <TextureJSX
        name="blit"
        width={width}
        height={height}
        textureSettings={rgbaTextureSettings("nearest")}
      />
      <SceneJSX name="offscreen">
        <ViewJSX
          name="main"
          type={View2D}
          config={{
            camera: camera.current,
            background: props.clear,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
          }}
          output={{
            buffers: { [FragmentOutputType.COLOR]: "color" },
            depth: props.depth ? "depth" : false,
            blit: { color: { [FragmentOutputType.COLOR]: "blit" } },
          }}
        />
        {providers.current.map((provider, i) => (
          <LayerJSX
            key={`circle${i}`}
            name={`circle${i}`}
            type={CircleLayer}
            providerRef={provider}
            config={{}}
          />
        ))}
      </SceneJSX>
      {DrawJSX({ name: "present", input: "blit" })}
    </TestSurface>
  );
};

registerFixture("resources/circle-target", CircleTargetFixture);
