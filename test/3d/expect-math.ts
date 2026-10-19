/**
 * The independent oracle of the 3D suite: a small perspective and orthographic
 * projection with a viewport transform, written by hand from the textbook
 * definitions. It must never import `ui/src/math` or `Projection3D` — those
 * are the code under test.
 *
 * Conventions, matching how the fixtures set up their scenes:
 *
 * - The camera sits at `position`. Without `lookAt` it looks down world -z,
 *   world +x is screen right and world +y is screen up. With `lookAt` it
 *   looks at `target` with `up` as screen up (the textbook look-at basis:
 *   forward f = normalize(target - position), right r = normalize(f × up),
 *   true up u = r × f).
 * - Perspective `fov` is the horizontal field of view in radians (deltav's
 *   `Camera.makePerspective` documents its fov as horizontal, see
 *   docs/math/vectors-matrices-quaternions.md); the vertical extent follows
 *   from the viewport aspect ratio.
 * - An orthographic `View3D` fits its frustum to the view's pixel size
 *   centred on the camera (docs/3d/view-and-projection.md), so one world unit
 *   is one pixel and the camera's x/y is the middle of the canvas.
 * - Pixels are canvas pixels, origin top-left, y down.
 */

export type V3 = [number, number, number];

interface CameraPlacement {
  /** Camera position, world units */
  position: V3;
  /** Aim the camera at `target` with `up` as screen up */
  lookAt?: { target: V3; up: V3 };
}

export interface PerspectiveSpec extends CameraPlacement {
  type: "perspective";
  /** Horizontal field of view, radians */
  fov: number;
  near: number;
  far: number;
}

export interface OrthographicSpec extends CameraPlacement {
  type: "orthographic";
  near: number;
  far: number;
}

export type CameraSpec = PerspectiveSpec | OrthographicSpec;

export interface Viewport {
  width: number;
  height: number;
}

/** A projected point: canvas pixel and the distance in front of the camera. */
export interface Projected {
  x: number;
  y: number;
  /** Distance along the view direction (positive in front of the camera) */
  distance: number;
}

function dot(a: V3, b: V3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: V3, b: V3): V3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function normalize(a: V3): V3 {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
}

/** The camera's right, up and forward axes in world space. */
export function cameraBasis(camera: CameraSpec) {
  if (!camera.lookAt) {
    return {
      right: [1, 0, 0] as V3,
      up: [0, 1, 0] as V3,
      forward: [0, 0, -1] as V3,
    };
  }
  const t = camera.lookAt.target;
  const forward = normalize([
    t[0] - camera.position[0],
    t[1] - camera.position[1],
    t[2] - camera.position[2],
  ]);
  const right = normalize(cross(forward, camera.lookAt.up));
  const up = cross(right, forward);
  return { right, up, forward };
}

/** Projects a world point to a canvas pixel. */
export function project(point: V3, camera: CameraSpec, vp: Viewport): Projected {
  // Camera space: translate by -position, then express in the camera basis
  // (right, up, -forward).
  const rel: V3 = [
    point[0] - camera.position[0],
    point[1] - camera.position[1],
    point[2] - camera.position[2],
  ];
  const { right, up, forward } = cameraBasis(camera);
  const cx = dot(rel, right);
  const cy = dot(rel, up);
  const cz = -dot(rel, forward);
  const distance = -cz;

  let ndcX: number;
  let ndcY: number;

  if (camera.type === "perspective") {
    if (distance <= 0) {
      throw new Error(`project: ${point} is not in front of the camera`);
    }
    // Half extents of the image plane at distance 1.
    const halfW = Math.tan(camera.fov / 2);
    const halfH = halfW * (vp.height / vp.width);
    ndcX = cx / distance / halfW;
    ndcY = cy / distance / halfH;
  } else {
    ndcX = cx / (vp.width / 2);
    ndcY = cy / (vp.height / 2);
  }

  return {
    x: ((ndcX + 1) / 2) * vp.width,
    y: ((1 - ndcY) / 2) * vp.height,
    distance,
  };
}

/** Axis-aligned pixel box, fractional edges. */
export interface PixelBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** The bounding box of a set of projected points. */
export function boundsOf(points: Projected[]): PixelBox {
  return {
    left: Math.min(...points.map((p) => p.x)),
    right: Math.max(...points.map((p) => p.x)),
    top: Math.min(...points.map((p) => p.y)),
    bottom: Math.max(...points.map((p) => p.y)),
  };
}

/**
 * The 8 corners of an axis-aligned box centred at `centre` with half extents
 * `half`.
 */
export function boxCorners(centre: V3, half: V3): V3[] {
  const out: V3[] = [];
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        out.push([
          centre[0] + sx * half[0],
          centre[1] + sy * half[1],
          centre[2] + sz * half[2],
        ]);
      }
    }
  }
  return out;
}

/**
 * The projected front face (+z face, the one facing the camera) of an
 * axis-aligned box: every pixel inside it shows that face.
 */
export function projectFrontFace(
  centre: V3,
  half: V3,
  camera: CameraSpec,
  vp: Viewport
): PixelBox {
  const z = centre[2] + half[2];
  return boundsOf(
    [
      [centre[0] - half[0], centre[1] - half[1], z],
      [centre[0] + half[0], centre[1] + half[1], z],
    ].map((p) => project(p as V3, camera, vp))
  );
}

/** The bounding box of the whole projected box (its silhouette fits inside). */
export function projectBox(
  centre: V3,
  half: V3,
  camera: CameraSpec,
  vp: Viewport
): PixelBox {
  return boundsOf(boxCorners(centre, half).map((p) => project(p, camera, vp)));
}

/** Intersection of two pixel boxes, or null if they do not overlap. */
export function intersect(a: PixelBox, b: PixelBox): PixelBox | null {
  const box = {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  };
  return box.left < box.right && box.top < box.bottom ? box : null;
}

/**
 * A fractional pixel box as a `PixelRect` for the harness probes, which
 * treat a pixel as inside when its centre is (the GL rasterisation rule).
 */
export function toRect(box: PixelBox) {
  return {
    x: box.left,
    y: box.top,
    width: box.right - box.left,
    height: box.bottom - box.top,
  };
}
