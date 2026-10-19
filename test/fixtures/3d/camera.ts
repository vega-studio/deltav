import React from "react";

import { Camera } from "../../../ui/src/index.js";
import type { CameraSpec } from "../../3d/expect-math.js";

/** Applies a spec's placement and frustum to a deltav Camera. */
export function applyCamera(camera: Camera, spec: CameraSpec) {
  camera.position = [...spec.position];
  // Camera.lookAt is the public way to aim a camera (raw transform rotations
  // turn opposite to the right-hand rule, report DELTAV-89). Without a target
  // the camera keeps the identity rotation (looking down -z).
  if (spec.lookAt) camera.lookAt([...spec.lookAt.target], [...spec.lookAt.up]);
  // A new options object so the camera sees the change; View3D refits the
  // width/height (perspective) or left/right/top/bottom (orthographic) to the
  // viewport on every frame.
  camera.projectionOptions = Object.assign(
    {},
    camera.projectionOptions,
    spec.type === "perspective"
      ? { fov: spec.fov, near: spec.near, far: spec.far }
      : { near: spec.near, far: spec.far }
  );
  camera.update(true);
}

/**
 * A deltav Camera built from a spec once per mount, re-applied whenever the
 * spec changes. The projection type is fixed by the first spec.
 */
export function useCamera(spec: CameraSpec) {
  const camera = React.useRef<Camera | null>(null);
  if (!camera.current) {
    camera.current =
      spec.type === "perspective"
        ? Camera.makePerspective({ fov: spec.fov, near: spec.near, far: spec.far })
        : Camera.makeOrthographic({ near: spec.near, far: spec.far });
    applyCamera(camera.current, spec);
  }

  const key = JSON.stringify(spec);
  React.useEffect(() => {
    if (camera.current) applyCamera(camera.current, spec);
  }, [key]);

  return camera.current;
}
