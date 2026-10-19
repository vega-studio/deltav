/**
 * Props of the 3D fixtures (type aliases, so they fit `FixtureProps`). Shared by the fixtures (browser) and the tests
 * (node), so this file has no runtime imports.
 */
import type { CameraSpec, V3 } from "../../3d/expect-math.js";

/** 0–1 RGBA colour. */
export type RGBA01 = [number, number, number, number];

/** One transform node of the scene graph a child instance can hang from. */
export interface ParentSpec {
  /** Local position */
  position: V3;
  /** Local scale */
  scale: V3;
  /** Index of this node's own parent in `parents`, if any */
  parent?: number | null;
}

/** One cube or triangle instance. */
export interface InstanceSpec {
  /** Local position of the instance's transform */
  position: V3;
  /**
   * Cube: half extents (the cube's vertices span ±1, docs/3d/layers.md).
   * Triangle: the scalar `size` the layer multiplies its vertices by.
   */
  size: V3 | number;
  /** Colour; only the flat layers draw it */
  color?: RGBA01;
  /** Rotation about the instance's local +Y axis, radians */
  rotationY?: number;
  /** Index into `parents`, or null/absent for no parent */
  parent?: number | null;
}

/** Props of the `3d/scene` fixture. */
export type IScene3DProps = {
  width: number;
  height: number;
  /** View background, 0–1 RGBA */
  clear: RGBA01;
  /** The View3D camera (no rotation: it looks down world -z) */
  camera: CameraSpec;
  /**
   * `cube` / `triangle`: the built-in CubeLayer (red faces, black edges) /
   * TriangleLayer (solid red). `flat-cube` / `flat-triangle`: their
   * flat-colour subclasses in flat-layers.ts, which paint `color`.
   */
  layer: "cube" | "triangle" | "flat-cube" | "flat-triangle";
  /**
   * Overrides the layer's `materialOptions` culling. Absent: the layer's
   * defaults are left alone.
   */
  culling?: "none" | "cw" | "ccw";
  /** Scene graph nodes; instances refer to them by index */
  parents?: ParentSpec[];
  /** The instances, in provider order */
  instances: InstanceSpec[];
};

/** Props of the `3d/layer-2d-in-3d` fixture. */
export type ILayer2DIn3DProps = {
  width: number;
  height: number;
  clear: RGBA01;
  camera: CameraSpec;
  /** The plane the 2D layer is mapped onto */
  axis: "XY" | "XZ" | "YZ";
  /** Top-left anchored rectangle in the 2D layer's coordinates */
  rect: { position: [number, number]; size: [number, number]; color: RGBA01 };
};
