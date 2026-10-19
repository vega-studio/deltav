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
import { LOAD_AREA, mainView2D, useView2DConfig } from "./stress-scene.js";
import { liveCount, random, type RGBA01, useStressLoop } from "./stress-loop.js";

export interface IChurnFixture {
  width: number;
  height: number;
  clear: RGBA01;
  /** Live load rectangles, kept constant */
  count: number;
  /** Per frame: rectangles moved, removed and added */
  moved: number;
  removed: number;
  added: number;
  /** Churn frames */
  frames: number;
  seed: number;
  color: RGBA01;
  /** Sentinel rects (top-left anchored), drawn by their own layer on top */
  sentinels: { position: [number, number]; size: [number, number]; color: RGBA01 }[];
}

/**
 * Stress: instance churn. `count` rectangles; every load frame moves `moved`,
 * removes `removed` and adds `added` of them. Records the live GL buffer count
 * after the first churn frame was drawn and every 10 frames.
 */
const ChurnFixture: React.FC<IChurnFixture> = (props) => {
  const live = React.useRef<RectangleInstance[]>([]);
  const load = React.useRef<InstanceProvider<RectangleInstance> | null>(null);
  const sentinels = React.useRef<InstanceProvider<RectangleInstance> | null>(null);
  const rand = React.useRef(random(props.seed));

  const make = () => {
    const r = rand.current;
    const w = 4 + r() * 8;
    const h = 4 + r() * 8;
    return new RectangleInstance({
      anchor: { type: AnchorType.TopLeft, padding: 0 },
      position: [
        LOAD_AREA.x + r() * (LOAD_AREA.width - w),
        LOAD_AREA.y + r() * (LOAD_AREA.height - h),
      ],
      size: [w, h],
      color: props.color,
    });
  };

  if (!load.current) {
    load.current = new InstanceProvider<RectangleInstance>();
    for (let i = 0; i < props.count; ++i) {
      const rect = make();
      live.current.push(rect);
      load.current.add(rect);
    }
    sentinels.current = new InstanceProvider<RectangleInstance>();
    for (const s of props.sentinels) {
      sentinels.current.add(
        new RectangleInstance({
          anchor: { type: AnchorType.TopLeft, padding: 0 },
          position: s.position,
          size: s.size,
          color: s.color,
        })
      );
    }
  }

  const { onSurface } = useStressLoop({
    scenario: "churn",
    frames: props.frames,
    onFrame(frame, state) {
      // Frame 0's churn is drawn by the time frame 2 runs.
      if (frame === 2) state.values.buffersAfterFirstChurnFrame = liveCount("buffers");
      if (frame % 10 === 0) {
        state.rounds.push({ frame, buffers: liveCount("buffers") });
      }

      const r = rand.current;
      const list = live.current;
      const provider = load.current!;
      for (let i = 0; i < props.moved; ++i) {
        const rect = list[Math.floor(r() * list.length)];
        rect.position = [
          LOAD_AREA.x + r() * (LOAD_AREA.width - rect.size[0]),
          LOAD_AREA.y + r() * (LOAD_AREA.height - rect.size[1]),
        ];
      }
      for (let i = 0; i < props.removed && list.length; ++i) {
        const at = Math.floor(r() * list.length);
        const rect = list[at];
        list[at] = list[list.length - 1];
        list.pop();
        provider.remove(rect);
      }
      for (let i = 0; i < props.added; ++i) {
        const rect = make();
        list.push(rect);
        provider.add(rect);
      }
      state.values.live = list.length;
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
      {mainView2D(view)}
      <LayerJSX name="load" type={RectangleLayer} providerRef={load} config={{}} />
      <LayerJSX
        name="sentinels"
        type={RectangleLayer}
        providerRef={sentinels}
        config={{}}
      />
    </TestSurface>
  );
};

registerFixture("stress/churn", ChurnFixture);
