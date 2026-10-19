import React from "react";

import {
  AnchorType,
  AtlasJSX,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { LOAD_AREA, mainView2D, useView2DConfig } from "./stress-scene.js";
import { type RGBA01, useStressLoop } from "./stress-loop.js";

export interface IAtlasFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Distinct generated images in the atlas */
  count: number;
  /** Size of each generated image, pixels */
  imageSize: number;
  /** Atlas size, pixels */
  atlasSize: number;
  /**
   * Which image set is shown: 0 the first, 1 replaces every source by a new,
   * distinct image.
   */
  generation: number;
  /** The sentinel image (instance 0), top-left anchored, solid per generation */
  sentinel: {
    position: [number, number];
    size: [number, number];
    colors: [RGBA01, RGBA01];
  };
}

/** A solid PNG data URL. (Canvas sources do not load: report DELTAV-75.) */
function solid(rgb: [number, number, number], width: number, height = width) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL("image/png");
}

/**
 * The source of image `i` of `generation`: the sentinel colour for i = 0, at
 * the sentinel's drawn size (texels map 1:1 to pixels, so filtering never
 * reaches a neighbour in the atlas), otherwise a colour unique to
 * (generation, i), so every image is distinct.
 */
function source(props: IAtlasFixture, i: number) {
  if (i === 0) {
    const c = props.sentinel.colors[props.generation];
    const rgb = [0, 1, 2].map((k) => Math.round(c[k] * 255)) as [number, number, number];
    return solid(rgb, props.sentinel.size[0], props.sentinel.size[1]);
  }
  const n = props.generation * props.count + i;
  return solid([n % 256, Math.floor(n / 256) % 256, 128], props.imageSize);
}

/**
 * Stress: atlas pressure. `count` distinct images in one atlas, laid out in a
 * grid in LOAD_AREA (instance 0 is the sentinel in the sentinel strip).
 * Changing `generation` replaces every source with a new image.
 */
const AtlasFixture: React.FC<IAtlasFixture> = (props) => {
  const { onSurface } = useStressLoop({ scenario: "atlas", frames: 0 });
  const images = React.useRef<ImageInstance[]>([]);
  const provider = React.useRef<InstanceProvider<ImageInstance> | null>(null);

  if (!provider.current) {
    provider.current = new InstanceProvider<ImageInstance>();
    const cell = props.imageSize + 4;
    const perRow = Math.floor(LOAD_AREA.width / cell);
    for (let i = 0; i < props.count; ++i) {
      const sentinel = i === 0;
      const image = new ImageInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        origin: sentinel
          ? props.sentinel.position
          : [
              LOAD_AREA.x + (i % perRow) * cell,
              LOAD_AREA.y + Math.floor(i / perRow) * cell,
            ],
        width: sentinel ? props.sentinel.size[0] : props.imageSize,
        height: sentinel ? props.sentinel.size[1] : props.imageSize,
        tint: [1, 1, 1, 1],
        source: source(props, i),
      });
      images.current.push(image);
      provider.current.add(image);
    }
  }

  const shown = React.useRef(props.generation);
  React.useEffect(() => {
    if (shown.current === props.generation) return;
    shown.current = props.generation;
    images.current.forEach((image, i) => {
      image.source = source(props, i);
    });
  }, [props.generation]);

  const view = useView2DConfig(props.clear);

  return (
    <TestSurface
      width={props.width}
      height={props.height}
      clear={props.clear}
      onSurface={onSurface}
    >
      <AtlasJSX name="atlas" width={props.atlasSize} height={props.atlasSize} />
      {mainView2D(view)}
      <LayerJSX
        name="images"
        type={ImageLayer}
        providerRef={provider}
        config={{ atlas: "atlas" }}
      />
    </TestSurface>
  );
};

registerFixture("stress/atlas", AtlasFixture);
