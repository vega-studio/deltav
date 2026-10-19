import React from "react";

import {
  AnchorType,
  AtlasJSX,
  FontJSX,
  GLSettings,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerJSX,
  TextureJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { type RGBA01, useViewConfig } from "./rect-scene.js";

export interface IResourcesFixture {
  width: number;
  height: number;
  /** View background, 0–1 RGBA */
  clear: RGBA01;
  /** Top-left corner of the image, world units */
  position: [number, number];
  /** Size of the image, world units */
  size: [number, number];
  /** The image's solid colour, 0–1 RGBA (opaque) */
  color: RGBA01;
  /** Where the label's top-left corner sits, world units */
  labelOrigin: [number, number];
  /** Label colour, 0–1 RGBA */
  labelColor: RGBA01;
  /**
   * How the image reaches the atlas: "dataURL" passes the solid canvas as a
   * PNG data URL string, "canvas" passes the HTMLCanvasElement itself.
   */
  source: "dataURL" | "canvas";
}

/** A canvas filled with one colour, used as the atlas image. */
function solidCanvas(color: RGBA01, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const [r, g, b, a] = color.map((c) => Math.round(c * 255));
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

/**
 * Teardown case (c): a TextureJSX, an AtlasJSX holding one image drawn by an
 * ImageLayer, and a FontJSX used by a LabelLayer.
 */
const ResourcesFixture: React.FC<IResourcesFixture> = (props) => {
  const config = useViewConfig(props.clear);
  const images = React.useRef<InstanceProvider<ImageInstance> | null>(null);
  const labels = React.useRef<InstanceProvider<LabelInstance> | null>(null);

  if (!images.current) {
    images.current = new InstanceProvider<ImageInstance>();
    images.current.add(
      new ImageInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        origin: props.position,
        width: props.size[0],
        height: props.size[1],
        tint: [1, 1, 1, 1],
        source:
          props.source === "canvas"
            ? solidCanvas(props.color, 16, 16)
            : solidCanvas(props.color, 16, 16).toDataURL("image/png"),
      })
    );
  }

  if (!labels.current) {
    labels.current = new InstanceProvider<LabelInstance>();
    labels.current.add(
      new LabelInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        origin: props.labelOrigin,
        color: props.labelColor,
        fontSize: 24,
        text: "Teardown",
      })
    );
  }

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <TextureJSX
        name="texture"
        width={64}
        height={64}
        textureSettings={{
          generateMipMaps: false,
          format: GLSettings.Texture.TexelDataType.RGBA,
          internalFormat: GLSettings.Texture.TexelDataType.RGBA,
        }}
      />
      <AtlasJSX name="atlas" width={256} height={256} />
      <FontJSX
        name="font"
        dynamic={true}
        fontSource={{
          family: "sans-serif",
          size: 32,
          weight: "normal",
          type: undefined,
        }}
      />
      <ViewJSX name="main" type={View2D} config={config} />
      <LayerJSX
        name="images"
        type={ImageLayer}
        providerRef={images}
        config={{ atlas: "atlas" }}
      />
      <LayerJSX
        name="labels"
        type={LabelLayer}
        providerRef={labels}
        config={{ resourceKey: "font" }}
      />
    </TestSurface>
  );
};

registerFixture("teardown/resources", ResourcesFixture);
