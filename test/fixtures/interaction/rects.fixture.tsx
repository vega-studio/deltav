import React from "react";

import {
  AnchorType,
  AutoEasingMethod,
  Camera2D,
  ClearFlags,
  InstanceProvider,
  LayerJSX,
  PickType,
  RectangleInstance,
  RectangleLayer,
  type Surface,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { registerFixture } from "../fixture-registry.js";
import { TestSurface } from "../test-surface.js";
import type { RectSpec, RectsHandle, RGBA01 } from "./handles.js";

export interface IRectsFixture {
  width: number;
  height: number;
  /** View background, 0–1 RGBA */
  clear: RGBA01;
  /** Rectangles present at mount, by test id */
  rects?: Record<string, RectSpec>;
  /** Animate `location` with AutoEasingMethod.linear(duration, delay) */
  easing?: { duration: number; delay: number };
  /**
   * Layer `picking` prop. Changing it forces deltav to rebuild the layer
   * (Layer.willUpdateProps), which is how the rebuild test triggers one.
   */
  picking?: boolean;
}

function makeRect(spec: RectSpec) {
  return new RectangleInstance({
    anchor: { type: AnchorType.TopLeft, padding: 0 },
    position: [...spec.position],
    size: [...spec.size],
    color: [...spec.color],
  });
}

/**
 * One RectangleLayer in an identity-camera View2D, whose instances the test
 * drives through `window.__dvInteractionRects`.
 */
const RectsFixture: React.FC<IRectsFixture> = (props) => {
  const provider = React.useRef<InstanceProvider<RectangleInstance> | null>(
    null
  );
  const byId = React.useRef(new Map<string, RectangleInstance>());
  const surface = React.useRef<Surface | null>(null);
  const camera = React.useRef(new Camera2D());

  if (!provider.current) {
    provider.current = new InstanceProvider<RectangleInstance>();
    for (const [id, spec] of Object.entries(props.rects ?? {})) {
      byId.current.set(id, provider.current.add(makeRect(spec)));
    }
  }

  // One easing method per mount: its uid keys the easing state.
  const animate = React.useMemo(
    () =>
      props.easing
        ? {
            location: AutoEasingMethod.linear<[number, number]>(
              props.easing.duration,
              props.easing.delay
            ),
          }
        : void 0,
    []
  );

  React.useEffect(() => {
    const instances = byId.current;
    const data = provider.current!;

    const handle: RectsHandle = {
      add(id, spec) {
        if (instances.has(id)) throw new Error(`rect "${id}" exists`);
        instances.set(id, data.add(makeRect(spec)));
      },
      update(id, spec) {
        const rect = instances.get(id);
        if (!rect) throw new Error(`no rect "${id}"`);
        if (spec.position) rect.position = [...spec.position];
        if (spec.size) rect.size = [...spec.size];
        if (spec.color) rect.color = [...spec.color];
      },
      remove(id) {
        const rect = instances.get(id);
        if (!rect) throw new Error(`no rect "${id}"`);
        data.remove(rect);
        instances.delete(id);
      },
      addGrid(prefix, count, opts) {
        for (let i = 0; i < count; ++i) {
          const col = i % opts.columns;
          const row = Math.floor(i / opts.columns);
          handle.add(`${prefix}${i}`, {
            position: [
              opts.origin[0] + col * opts.cell,
              opts.origin[1] + row * opts.cell,
            ],
            size: opts.size,
            color: opts.color,
          });
        }
      },
      removeAll() {
        for (const rect of instances.values()) data.remove(rect);
        instances.clear();
      },
      count() {
        return instances.size;
      },
      easingWithRow(id, row) {
        const rect = instances.get(id);
        if (!rect) throw new Error(`no rect "${id}"`);
        const easing = rect.getEasing(RectangleLayer.attributeNames.location);
        const now = surface.current?.frameMetrics.currentTime ?? -1;
        const pixels = window.__deltav!.readPixels(0, row, props.width, 1);
        return {
          easing: easing
            ? {
                now,
                startTime: easing.startTime,
                duration: easing.duration,
                start: Array.from(easing.start),
                end: Array.from(easing.end),
              }
            : null,
          row: pixels.data,
          width: props.width,
        };
      },
    };

    window.__dvInteractionRects = handle;
    return () => {
      delete window.__dvInteractionRects;
    };
  }, []);

  return (
    <TestSurface
      width={props.width}
      height={props.height}
      clear={props.clear}
      onSurface={(s) => (surface.current = s)}
    >
      <ViewJSX
        name="main"
        type={View2D}
        config={{
          camera: camera.current,
          background: props.clear,
          clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
        }}
      />
      <LayerJSX
        name="rects"
        type={RectangleLayer}
        providerRef={provider}
        config={{
          animate,
          picking: props.picking ? PickType.SINGLE : PickType.NONE,
        }}
      />
    </TestSurface>
  );
};

registerFixture("interaction/rects", RectsFixture);
