import { describe, expect, it } from "@jest/globals";

import {
  type CameraSpec,
  intersect,
  project,
  projectBox,
  projectFrontFace,
} from "./expect-math.js";

/**
 * Checks the 3D oracle against points computed by hand (node only, no
 * browser). Each expected number below is worked out in the comment next to
 * it, not taken from a run.
 */
const VP = { width: 200, height: 200 };

describe("3D expectation maths (hand-computed)", () => {
  it("projects through a 90° perspective camera", () => {
    const camera: CameraSpec = {
      type: "perspective",
      fov: Math.PI / 2,
      near: 1,
      far: 100,
      position: [0, 0, 10],
    };
    // Camera space (5, 5, -10): distance 10, tan(45°) = 1, so NDC is
    // (5/10, 5/10) = (0.5, 0.5): x = 1.5/2*200 = 150, y = 0.5/2*200 = 50.
    const p = project([5, 5, 0], camera, VP);
    expect(p.x).toBeCloseTo(150, 10);
    expect(p.y).toBeCloseTo(50, 10);
    expect(p.distance).toBeCloseTo(10, 10);

    // The point straight ahead lands on the canvas centre.
    const c = project([0, 0, -3], camera, VP);
    expect(c.x).toBeCloseTo(100, 10);
    expect(c.y).toBeCloseTo(100, 10);
  });

  it("projects through a 60° perspective camera on a wide viewport", () => {
    const camera: CameraSpec = {
      type: "perspective",
      fov: Math.PI / 3,
      near: 1,
      far: 100,
      position: [1, 0, 0],
    };
    // 400×200: tan(30°) = 1/√3 horizontally, half that vertically.
    // Point (1 + 4s, -2s, -4), s = 1/√3: camera space (4s, -2s, -4), distance
    // 4, NDC x = (4s/4)/s = 1 and NDC y = (-2s/4)/(s/2) = -1: the bottom-right corner.
    const s = 1 / Math.sqrt(3);
    const p = project([1 + 4 * s, -2 * s, -4], camera, { width: 400, height: 200 });
    expect(p.x).toBeCloseTo(400, 10);
    expect(p.y).toBeCloseTo(200, 10);
  });

  it("projects through an orthographic camera one unit per pixel", () => {
    const camera: CameraSpec = {
      type: "orthographic",
      near: 1,
      far: 100,
      position: [10, -10, 50],
    };
    // Camera space (20, 50, ...): x = 100 + 20 = 120, y = 100 - 50 = 50.
    const p = project([30, 40, -5], camera, VP);
    expect(p.x).toBeCloseTo(120, 10);
    expect(p.y).toBeCloseTo(50, 10);
    expect(p.distance).toBeCloseTo(55, 10);
  });

  it("projects through a camera turned to look straight down", () => {
    const camera: CameraSpec = {
      type: "orthographic",
      near: 1,
      far: 100,
      position: [0, 50, 0],
      lookAt: { target: [0, 0, 0], up: [0, 0, -1] },
    };
    // f = (0, -1, 0); r = f × up = (0,-1,0) × (0,0,-1) = (1, 0, 0);
    // u = r × f = (1,0,0) × (0,-1,0) = (0, 0, -1). So world +z is screen
    // down: (10, 0, 20) is 10 px right of and 20 px below the centre, 50 units
    // in front of the camera.
    const p = project([10, 0, 20], camera, VP);
    expect(p.x).toBeCloseTo(110, 10);
    expect(p.y).toBeCloseTo(120, 10);
    expect(p.distance).toBeCloseTo(50, 10);
  });

  it("projects a box's front face and silhouette", () => {
    const camera: CameraSpec = {
      type: "perspective",
      fov: Math.PI / 2,
      near: 1,
      far: 100,
      position: [0, 0, 10],
    };
    // Front face z = 1 at distance 9: half extent 1 → 1/9 NDC → 100/9 px.
    const face = projectFrontFace([0, 0, 0], [1, 1, 1], camera, VP);
    expect(face.left).toBeCloseTo(100 - 100 / 9, 10);
    expect(face.right).toBeCloseTo(100 + 100 / 9, 10);
    expect(face.top).toBeCloseTo(100 - 100 / 9, 10);
    // The silhouette of a centred box is its front face.
    const box = projectBox([0, 0, 0], [1, 1, 1], camera, VP);
    expect(box.left).toBeCloseTo(face.left, 10);
    expect(box.bottom).toBeCloseTo(face.bottom, 10);
    expect(intersect(face, { left: 0, top: 0, right: 50, bottom: 50 })).toBe(
      null
    );
  });

  it("refuses a point behind a perspective camera", () => {
    const camera: CameraSpec = {
      type: "perspective",
      fov: Math.PI / 2,
      near: 1,
      far: 100,
      position: [0, 0, 0],
    };
    expect(() => project([0, 0, 5], camera, VP)).toThrow(/front/);
  });
});
