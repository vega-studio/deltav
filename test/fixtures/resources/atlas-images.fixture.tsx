import React from "react";

import {
  AnchorType,
  AtlasJSX,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import {
  quadrantCanvas,
  type RGBA01,
  solidCanvas,
  useViewConfig,
} from "./common.js";

/** One image of the atlas fixture, placed 1:1 (one texel per pixel). */
export interface IAtlasImage {
  /** Stable identity across updates */
  id: string;
  /** Top-left corner, world units (= pixels) */
  x: number;
  y: number;
  /** Image size in texels and in world units */
  size: number;
  /**
   * One colour fills the image; four are its top-left, top-right,
   * bottom-left and bottom-right quadrants.
   */
  colors: RGBA01[];
}

export interface IAtlasImagesFixture {
  width: number;
  height: number;
  clear: RGBA01;
  images: IAtlasImage[];
}

/** The PNG data URL of an image's in-page canvas. */
function imageSource(image: IAtlasImage) {
  const canvas =
    image.colors.length === 4
      ? quadrantCanvas(
          image.colors as [RGBA01, RGBA01, RGBA01, RGBA01],
          image.size,
          image.size
        )
      : solidCanvas(image.colors[0], image.size, image.size);
  return canvas.toDataURL("image/png");
}

/**
 * An AtlasJSX packing every image of `images` (each a data URL of an in-page
 * canvas), drawn by one ImageLayer at 1:1 scale. Updating `images` removes the
 * instances whose id is gone and adds the new ones while mounted.
 */
const AtlasImagesFixture: React.FC<IAtlasImagesFixture> = (props) => {
  const config = useViewConfig(props.clear);
  const provider = React.useRef<InstanceProvider<ImageInstance> | null>(null);
  const live = React.useRef(new Map<string, ImageInstance>());
  if (!provider.current) provider.current = new InstanceProvider();

  const images = provider.current;
  const wanted = new Set(props.images.map((i) => i.id));
  live.current.forEach((instance, id) => {
    if (wanted.has(id)) return;
    images.remove(instance);
    live.current.delete(id);
  });
  props.images.forEach((image) => {
    if (live.current.has(image.id)) return;
    live.current.set(
      image.id,
      images.add(
        new ImageInstance({
          anchor: { type: AnchorType.TopLeft, padding: 0 },
          origin: [image.x, image.y],
          width: image.size,
          height: image.size,
          tint: [1, 1, 1, 1],
          source: imageSource(image),
        })
      )
    );
  });

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      <AtlasJSX name="atlas" width={256} height={256} />
      <ViewJSX name="main" type={View2D} config={config} />
      <LayerJSX
        name="images"
        type={ImageLayer}
        providerRef={provider}
        config={{ atlas: "atlas" }}
      />
    </TestSurface>
  );
};

registerFixture("resources/atlas-images", AtlasImagesFixture);
