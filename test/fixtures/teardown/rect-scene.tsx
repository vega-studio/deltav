import React from "react";

import {
  AnchorType,
  Camera2D,
  ClearFlags,
  InstanceProvider,
  RectangleInstance,
} from "../../../ui/src/index.js";

/** 0–1 RGBA colour. */
export type RGBA01 = [number, number, number, number];

/** The props every teardown fixture takes: canvas size, clear colour, one rect. */
export interface ITeardownRectProps {
  width: number;
  height: number;
  /** View background, 0–1 RGBA */
  clear: RGBA01;
  /** Top-left corner of the rectangle, world units */
  position: [number, number];
  /** Size of the rectangle, world units */
  size: [number, number];
  /** Rectangle colour, 0–1 RGBA */
  color: RGBA01;
}

/**
 * A provider holding one top-left-anchored RectangleInstance, created once per
 * mount of the calling component.
 */
export function useRectProvider(props: ITeardownRectProps) {
  const provider = React.useRef<InstanceProvider<RectangleInstance> | null>(
    null
  );
  if (!provider.current) {
    provider.current = new InstanceProvider<RectangleInstance>();
    provider.current.add(
      new RectangleInstance({
        anchor: { type: AnchorType.TopLeft, padding: 0 },
        position: props.position,
        size: props.size,
        color: props.color,
      })
    );
  }
  return provider;
}

/** The config of an identity-camera View2D clearing to `clear`. */
export function useViewConfig(clear: RGBA01) {
  const camera = React.useRef(new Camera2D());
  return {
    camera: camera.current,
    background: clear,
    clearFlags: [ClearFlags.COLOR, ClearFlags.DEPTH],
  };
}
