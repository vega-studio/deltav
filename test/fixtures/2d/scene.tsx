import React from "react";

import {
  Camera2D,
  ClearFlags,
  type Instance,
  InstanceProvider,
  LayerJSX,
  View2D,
  ViewJSX,
} from "../../../ui/src/index.js";
import { TestSurface } from "../test-surface.js";

/** 0–1 RGBA colour. */
export type RGBA01 = [number, number, number, number];

/** A View2D of a 2D fixture, JSON-serialisable. */
export interface ViewSpec {
  name: string;
  /** Viewport on the canvas, pixels. Default: the whole canvas. */
  viewport?: { left: number; top: number; width: number; height: number };
  /** Camera2D offset, world units. Default [0, 0]. */
  offset?: [number, number];
  /** Camera2D scale. Default [1, 1]. */
  scale?: [number, number];
  /** View background. Default: the fixture's clear colour. */
  background?: RGBA01;
}

/** A LayerJSX of a 2D fixture: its instances and layer config, as JSON. */
export interface LayerSpec<TSpec = any> {
  name: string;
  instances: TSpec[];
  config?: Record<string, any>;
}

/** The props of every 2D layer fixture. */
export interface IScene2DProps<TSpec = any> {
  width: number;
  height: number;
  /** View background, 0–1 RGBA */
  clear: RGBA01;
  /** Views; default one full-canvas "main" view with an identity camera. */
  views?: ViewSpec[];
  /** Layers, drawn in this order. */
  layers: LayerSpec<TSpec>[];
}

/**
 * Turns the JSON specs of one layer kind into deltav objects: the layer class,
 * an instance per spec, the update of a live instance when its spec changes,
 * and the layer config.
 */
export interface LayerKind<TInstance extends Instance, TSpec> {
  type: any;
  create(spec: TSpec, layer: string, index: number): TInstance;
  update(instance: TInstance, spec: TSpec): void;
  config?(config: Record<string, any>): Record<string, any>;
  /** Resource tags the kind needs (fonts, atlases), direct SurfaceJSX children. */
  resources?: React.ReactNode;
}

/** Copies every top-level field of a spec onto an instance. */
export function assignSpec(instance: any, spec: Record<string, any>) {
  for (const key of Object.keys(spec)) instance[key] = spec[key];
}

/**
 * What a 2D fixture reports to the test page: per layer name, values
 * instances published once ready (label sizes). Reset on every mount.
 */
export interface Fixture2DReport {
  ready: Record<string, Record<number, any>>;
}

declare global {
  interface Window {
    __fixture2d?: Fixture2DReport;
  }
}

/** Publishes `value` for instance `index` of layer `layer` to the test. */
export function report2D(layer: string, index: number, value: any) {
  const r = (window.__fixture2d = window.__fixture2d || { ready: {} });
  (r.ready[layer] = r.ready[layer] || {})[index] = value;
}

/**
 * A 2D scene built from JSON props: root views (each with its own Camera2D)
 * and root layers of one kind. On a props update the instances are synced in
 * place (by index), so a test can mutate instances, and the layer list is
 * re-rendered, so a test can add and remove LayerJSX children.
 */
export function Scene2D<TInstance extends Instance, TSpec>(
  props: IScene2DProps<TSpec> & { kind: LayerKind<TInstance, TSpec> }
) {
  const { kind } = props;
  const providers = React.useRef(
    new Map<
      string,
      {
        ref: React.MutableRefObject<InstanceProvider<TInstance> | null>;
        instances: TInstance[];
      }
    >()
  );
  const cameras = React.useRef(new Map<string, Camera2D>());

  React.useState(() => {
    window.__fixture2d = { ready: {} };
  });

  const views = props.views ?? [{ name: "main" }];

  // Sync each layer's provider with its specs, during render so a newly
  // listed layer has its provider before its LayerJSX mounts.
  for (const layer of props.layers) {
    let entry = providers.current.get(layer.name);
    if (!entry) {
      entry = { ref: { current: new InstanceProvider<TInstance>() }, instances: [] };
      providers.current.set(layer.name, entry);
    }
    const provider = entry.ref.current!;
    layer.instances.forEach((spec, i) => {
      const live = entry!.instances[i];
      if (live) kind.update(live, spec);
      else entry!.instances[i] = provider.add(kind.create(spec, layer.name, i));
    });
    for (const extra of entry.instances.splice(layer.instances.length)) {
      provider.remove(extra);
    }
  }

  const camera = (view: ViewSpec) => {
    let cam = cameras.current.get(view.name);
    const offset: [number, number, number] = [...(view.offset ?? [0, 0]), 0] as any;
    const scale: [number, number, number] = [...(view.scale ?? [1, 1]), 1] as any;
    if (!cam) {
      cam = new Camera2D({ offset, scale });
      cameras.current.set(view.name, cam);
    }
    return cam;
  };

  return (
    <TestSurface width={props.width} height={props.height} clear={props.clear}>
      {kind.resources}
      {views.map((view) => (
        <ViewJSX
          key={view.name}
          name={view.name}
          type={View2D}
          config={{
            camera: camera(view),
            background: view.background ?? props.clear,
            clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
            ...(view.viewport ? { viewport: view.viewport } : {}),
          }}
        />
      ))}
      {props.layers.map((layer) => (
        <LayerJSX
          key={layer.name}
          name={layer.name}
          type={kind.type}
          providerRef={providers.current.get(layer.name)!.ref}
          config={kind.config ? kind.config(layer.config ?? {}) : layer.config ?? {}}
        />
      ))}
    </TestSurface>
  );
}
