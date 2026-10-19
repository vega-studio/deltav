import React from "react";

import {
  AnchorType,
  FontJSX,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import { LOAD_AREA, mainView2D, useView2DConfig } from "./stress-scene.js";
import { liveCount, random, type RGBA01, useStressLoop } from "./stress-loop.js";

export interface ILabelsFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Load labels in LOAD_AREA */
  count: number;
  /** Characters per load label */
  length: number;
  /** Alphabet the load texts are drawn from */
  alphabet: string;
  /** Every `every` frames all load texts change */
  every: number;
  frames: number;
  seed: number;
  fontSize: number;
  color: RGBA01;
  /** The sentinel label (top-left anchored), in its own layer */
  sentinel: { origin: [number, number]; text: string; fontSize: number; color: RGBA01 };
}

/**
 * Stress: glyph churn. `count` labels whose texts all change every `every`
 * frames. Records the live texture count once per churn round.
 */
const LabelsFixture: React.FC<ILabelsFixture> = (props) => {
  const rand = React.useRef(random(props.seed));
  const live = React.useRef<LabelInstance[]>([]);
  const load = React.useRef<InstanceProvider<LabelInstance> | null>(null);
  const sentinel = React.useRef<InstanceProvider<LabelInstance> | null>(null);

  const text = () => {
    let out = "";
    for (let i = 0; i < props.length; ++i) {
      out += props.alphabet[Math.floor(rand.current() * props.alphabet.length)];
    }
    return out;
  };

  if (!load.current) {
    const r = rand.current;
    load.current = new InstanceProvider<LabelInstance>();
    // A label is at most `length` em wide and one em tall: keep it in the area.
    const maxW = props.length * props.fontSize;
    for (let i = 0; i < props.count; ++i) {
      const label = new LabelInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        origin: [
          LOAD_AREA.x + r() * (LOAD_AREA.width - maxW),
          LOAD_AREA.y + r() * (LOAD_AREA.height - 2 * props.fontSize),
        ],
        color: props.color,
        fontSize: props.fontSize,
        text: text(),
      });
      live.current.push(label);
      load.current.add(label);
    }
    sentinel.current = new InstanceProvider<LabelInstance>();
    sentinel.current.add(
      new LabelInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        origin: props.sentinel.origin,
        color: props.sentinel.color,
        fontSize: props.sentinel.fontSize,
        text: props.sentinel.text,
      })
    );
  }

  const { onSurface } = useStressLoop({
    scenario: "labels",
    frames: props.frames,
    onFrame(frame, state) {
      if (frame % props.every !== 0) return;
      state.rounds.push({ frame, textures: liveCount("textures") });
      for (const label of live.current) label.text = text();
    },
  });
  const view = useView2DConfig(props.clear);

  return (
    <TestSurface
      width={props.width}
      height={props.height}
      clear={props.clear}
      onSurface={onSurface}
    >
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
      {mainView2D(view)}
      <LayerJSX
        name="load"
        type={LabelLayer}
        providerRef={load}
        config={{ resourceKey: "font" }}
      />
      <LayerJSX
        name="sentinel"
        type={LabelLayer}
        providerRef={sentinel}
        config={{ resourceKey: "font" }}
      />
    </TestSurface>
  );
};

registerFixture("stress/labels", LabelsFixture);
