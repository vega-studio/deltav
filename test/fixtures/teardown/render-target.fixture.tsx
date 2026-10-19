import React from "react";

import {
  CircleInstance,
  CircleLayer,
  ColorBufferJSX,
  DepthBufferJSX,
  DrawJSX,
  FragmentOutputType,
  GLSettings,
  InstanceProvider,
  LayerJSX,
  RectangleLayer,
  SceneJSX,
  TextureJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import {
  type ITeardownRectProps,
  useRectProvider,
  useViewConfig,
} from "./rect-scene.js";

export interface IRenderTargetFixture extends ITeardownRectProps {
  /**
   * What draws into the render target: "circle" draws a CircleLayer circle
   * inscribed in the rect (centre = rect centre, radius = half the smaller
   * side); "rect" draws the RectangleLayer rect itself.
   */
  layer: "circle" | "rect";
}

/** A provider holding one circle inscribed in the fixture's rect. */
function useCircleProvider(props: ITeardownRectProps) {
  const provider = React.useRef<InstanceProvider<CircleInstance> | null>(null);
  if (!provider.current) {
    provider.current = new InstanceProvider<CircleInstance>();
    provider.current.add(
      new CircleInstance({
        center: [
          props.position[0] + props.size[0] / 2,
          props.position[1] + props.size[1] / 2,
        ],
        radius: Math.min(props.size[0], props.size[1]) / 2,
        color: props.color,
      })
    );
  }
  return provider;
}

/**
 * Teardown case (b): a view renders the rect into a single (non-MRT)
 * ColorBufferJSX colour renderbuffer with a DepthBufferJSX depth renderbuffer,
 * blits the colour into a texture, and DrawJSX draws that texture to the
 * screen as a full-screen quad.
 */
const RenderTargetFixture: React.FC<IRenderTargetFixture> = (props) => {
  const rects = useRectProvider(props);
  const circles = useCircleProvider(props);
  const config = useViewConfig(props.clear);
  const { width, height } = props;

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
      <DepthBufferJSX
        name="depth"
        width={width}
        height={height}
        config={{
          internalFormat:
            GLSettings.RenderTarget.DepthBufferFormat.DEPTH_COMPONENT16,
        }}
      />
      <TextureJSX
        name="blit"
        width={width}
        height={height}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <SceneJSX name="offscreen">
        <ViewJSX
          name="main"
          type={View2D}
          config={config}
          output={{
            buffers: { [FragmentOutputType.COLOR]: "color" },
            depth: "depth",
            blit: { color: { [FragmentOutputType.COLOR]: "blit" } },
          }}
        />
        {props.layer === "rect" ? (
          <LayerJSX
            name="shape"
            type={RectangleLayer}
            providerRef={rects}
            config={{}}
          />
        ) : (
          <LayerJSX
            name="shape"
            type={CircleLayer}
            providerRef={circles}
            config={{}}
          />
        )}
      </SceneJSX>
      {DrawJSX({ name: "present", input: "blit" })}
    </TestSurface>
  );
};

registerFixture("teardown/render-target", RenderTargetFixture);
