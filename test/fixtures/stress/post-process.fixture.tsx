import React from "react";

import {
  BloomJSX,
  BoxSampleJSX,
  BoxSampleJSXDirection,
  CircleInstance,
  CircleLayer,
  DrawJSX,
  FragmentOutputType,
  GaussHorizontalBlurJSX,
  GaussVerticalBlurJSX,
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
import { useView2DConfig } from "./stress-scene.js";
import { type RGBA01, useStressLoop } from "./stress-loop.js";

export interface IPostProcessFixture {
  /** Square canvas size, pixels */
  size: number;
  clear: RGBA01;
  /**
   * The circle the scene draws into the `color` texture. (A RectangleLayer
   * does not compile into a render target: report DELTAV-74.)
   */
  center: [number, number];
  radius: number;
  color: RGBA01;
  /**
   * With the gauss blurs (passes 1–2) or without them (bloom reads `color`
   * directly).
   */
  blur: boolean;
  frames: number;
}

const RGBA_TEXTURE = {
  generateMipMaps: false,
  format: GLSettings.Texture.TexelDataType.RGBA,
  internalFormat: GLSettings.Texture.TexelDataType.RGBA,
};

/**
 * Stress: a post-process chain on a large canvas. The scene renders one circle
 * into `color`, then:
 *   1. gauss horizontal blur  color → blurH
 *   2. gauss vertical blur    blurH → blurV
 *   3–5. bloom (2 samples, no compose): box down blurV → half, box down
 *        half → quarter, box up quarter → half (additive)
 *   6. box sample up          half → up
 *   7. draw                   up → screen
 * Without `blur`, passes 1–2 are left out and bloom reads `color`.
 */
const PostProcessFixture: React.FC<IPostProcessFixture> = (props) => {
  const { onSurface } = useStressLoop({
    scenario: "post-process",
    frames: props.frames,
  });
  const circles = React.useRef<InstanceProvider<CircleInstance> | null>(null);
  if (!circles.current) {
    circles.current = new InstanceProvider<CircleInstance>();
    circles.current.add(
      new CircleInstance({
        center: props.center,
        radius: props.radius,
        color: props.color,
      })
    );
  }
  const view = useView2DConfig(props.clear);
  const { size } = props;

  return (
    <TestSurface width={size} height={size} clear={props.clear} onSurface={onSurface}>
      <TextureJSX name="color" width={size} height={size} textureSettings={RGBA_TEXTURE} />
      <TextureJSX name="blurH" width={size} height={size} textureSettings={RGBA_TEXTURE} />
      <TextureJSX name="blurV" width={size} height={size} textureSettings={RGBA_TEXTURE} />
      <TextureJSX
        name="half"
        width={size / 2}
        height={size / 2}
        textureSettings={RGBA_TEXTURE}
      />
      <TextureJSX
        name="quarter"
        width={size / 4}
        height={size / 4}
        textureSettings={RGBA_TEXTURE}
      />
      <TextureJSX name="up" width={size} height={size} textureSettings={RGBA_TEXTURE} />
      <SceneJSX name="scene">
        <ViewJSX
          name="main"
          type={View2D}
          config={view}
          output={{
            buffers: { [FragmentOutputType.COLOR]: "color" },
            depth: true,
          }}
        />
        <LayerJSX name="circles" type={CircleLayer} providerRef={circles} config={{}} />
      </SceneJSX>
      {props.blur
        ? GaussHorizontalBlurJSX({ name: "blur-h", input: "color", output: "blurH" })
        : null}
      {props.blur
        ? GaussVerticalBlurJSX({ name: "blur-v", input: "blurH", output: "blurV" })
        : null}
      {BloomJSX({
        name: "bloom",
        samples: 2,
        resources: [props.blur ? "blurV" : "color", "half", "quarter"],
      })}
      {BoxSampleJSX({
        name: "box-up",
        input: "half",
        output: "up",
        direction: BoxSampleJSXDirection.UP,
      })}
      {DrawJSX({ name: "draw", input: "up" })}
    </TestSurface>
  );
};

registerFixture("stress/post-process", PostProcessFixture);
