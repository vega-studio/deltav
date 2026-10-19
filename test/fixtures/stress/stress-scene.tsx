import React from "react";

import { Camera2D, ClearFlags, View2D, ViewJSX } from "../../../ui/src/index.js";
import type { RGBA01 } from "./stress-loop.js";

/**
 * Layout shared by the 2D stress fixtures (canvas 800×600, identity camera, so
 * world units are canvas pixels): the load fills the LOAD area, and sentinels
 * sit in the SENTINEL strip to its right, where nothing else draws, so their
 * negative probes see the clear colour.
 */
export const LOAD_AREA = { x: 0, y: 0, width: 520, height: 600 };
export const SENTINEL_STRIP = { x: 560, y: 0, width: 240, height: 600 };

/** The config of an identity-camera View2D clearing to `clear`. */
export function useView2DConfig(clear: RGBA01) {
  const camera = React.useRef(new Camera2D());
  return {
    camera: camera.current,
    background: clear,
    clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
  };
}

/**
 * The `main` View2D element every 2D stress fixture renders through. A
 * function, not a component: SurfaceJSX only accepts its own tags as direct
 * children, so a wrapper component would be dropped.
 */
export function mainView2D(config: ReturnType<typeof useView2DConfig>) {
  return <ViewJSX name="main" type={View2D} config={config} />;
}

/** A ref-like holder, for providers created outside a hook (many layers). */
export function holder<T>(value: T): { current: T } {
  return { current: value };
}
