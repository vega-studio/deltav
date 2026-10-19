import React from "react";

import {
  AnchorType,
  InstanceProvider,
  LayerJSX,
  RectangleInstance,
  RectangleLayer,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { holder, LOAD_AREA, mainView2D, useView2DConfig } from "./stress-scene.js";
import { random, type RGBA01, useStressLoop } from "./stress-loop.js";

export interface IManyLayersFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** RectangleLayers, each with its own provider */
  layers: number;
  /** Rectangles per layer, in LOAD_AREA */
  perLayer: number;
  seed: number;
  color: RGBA01;
  /** The sentinel rect, in the last layer */
  sentinel: { position: [number, number]; size: [number, number]; color: RGBA01 };
  frames: number;
}

/**
 * Stress: shader and program generation. `layers` RectangleLayers of
 * `perLayer` rectangles each; the last layer also holds the sentinel.
 */
const ManyLayersFixture: React.FC<IManyLayersFixture> = (props) => {
  const { onSurface } = useStressLoop({
    scenario: "many-layers",
    frames: props.frames,
  });
  const providers = React.useRef<{ current: InstanceProvider<RectangleInstance> }[] | null>(
    null
  );

  if (!providers.current) {
    const r = random(props.seed);
    providers.current = [];
    for (let l = 0; l < props.layers; ++l) {
      const provider = new InstanceProvider<RectangleInstance>();
      for (let i = 0; i < props.perLayer; ++i) {
        const w = 4 + r() * 8;
        const h = 4 + r() * 8;
        provider.add(
          new RectangleInstance({
            anchor: { type: AnchorType.TopLeft, padding: 0 },
            position: [
              LOAD_AREA.x + r() * (LOAD_AREA.width - w),
              LOAD_AREA.y + r() * (LOAD_AREA.height - h),
            ],
            size: [w, h],
            color: props.color,
          })
        );
      }
      if (l === props.layers - 1) {
        provider.add(
          new RectangleInstance({
            anchor: { type: AnchorType.TopLeft, padding: 0 },
            position: props.sentinel.position,
            size: props.sentinel.size,
            color: props.sentinel.color,
          })
        );
      }
      providers.current.push(holder(provider));
    }
  }

  const view = useView2DConfig(props.clear);

  return (
    <TestSurface
      width={props.width}
      height={props.height}
      clear={props.clear}
      onSurface={onSurface}
    >
      {mainView2D(view)}
      {providers.current.map((provider, l) => (
        <LayerJSX
          key={`layer-${l}`}
          name={`layer-${l}`}
          type={RectangleLayer}
          providerRef={provider}
          config={{}}
        />
      ))}
    </TestSurface>
  );
};

registerFixture("stress/many-layers", ManyLayersFixture);
