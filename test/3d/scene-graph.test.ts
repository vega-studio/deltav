import { afterEach, describe, it, test } from "bun:test";

import { type FixturePage, useFixturePage } from "../harness/browser.js";
import { mountCycle } from "../harness/mount-cycle.js";
import { expectRegion } from "../harness/probe.js";
import type {
  IScene3DProps,
  ParentSpec,
} from "../fixtures/3d/scene-props.js";
import {
  type CameraSpec,
  projectBox,
  projectFrontFace,
  toRect,
  type V3,
} from "./expect-math.js";
import {
  BASE,
  BLUE,
  clear255,
  eventually,
  expectAllClear,
  expectShape,
  update,
  VP,
} from "./helpers.js";

/**
 * Scene graph: a child cube (flat-colour CubeLayer, test/fixtures/3d/
 * flat-layers.ts) hangs from Transform parents. Its world placement is
 * composed by hand: world = parent.position + parent.scale * child.position,
 * half extent = parent.scale * child.size (docs/3d/scene-graph.md: SRT, then
 * matrix = parent.matrix × localMatrix). An orthographic camera keeps one
 * world unit per pixel so the composed position reads directly.
 */
const CAMERA: CameraSpec = {
  type: "orthographic",
  near: 1,
  far: 1000,
  position: [0, 0, 100],
};

const CHILD_POS: V3 = [5, 5, 0];
const CHILD_HALF = 4;

const P0: ParentSpec = { position: [20, -10, 0], scale: [2, 2, 2] };
const P1: ParentSpec = { position: [-40, 30, 0], scale: [1, 1, 1] };

function compose(parents: ParentSpec[], chain: number[]): { centre: V3; half: V3 } {
  // Apply the child's local SRT, then each ancestor's, innermost first.
  let centre: V3 = [...CHILD_POS];
  let half: V3 = [CHILD_HALF, CHILD_HALF, CHILD_HALF];
  for (const i of chain) {
    const p = parents[i];
    centre = [0, 1, 2].map((k) => p.position[k] + p.scale[k] * centre[k]) as V3;
    half = [0, 1, 2].map((k) => p.scale[k] * half[k]) as V3;
  }
  return { centre, half };
}

function props(parents: ParentSpec[], parent: number | null): IScene3DProps {
  return {
    ...BASE,
    camera: CAMERA,
    layer: "flat-cube",
    parents,
    instances: [
      { position: CHILD_POS, size: CHILD_HALF, color: BLUE, parent },
    ],
  };
}

async function expectChildAt(page: FixturePage, at: { centre: V3; half: V3 }) {
  await expectShape(
    page,
    projectFrontFace(at.centre, at.half, CAMERA, VP),
    projectBox(at.centre, at.half, CAMERA, VP),
    BLUE
  );
}

/** Where the child was is clear now. */
async function expectGoneFrom(page: FixturePage, at: { centre: V3; half: V3 }) {
  await expectRegion(
    page,
    toRect(projectFrontFace(at.centre, at.half, CAMERA, VP)),
    clear255()
  );
}

describe("3D scene graph", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  // DEFECT: a parented Instance3D added as a layer's first instance renders at its local matrix: the buffer manager's registration pass reads `o.matrix` before the instance is active, Transform.update skips writing the world matrix to an inactive instance and clears its flags, so the instance keeps the pre-parenting matrix array (report DELTAV-86)
  test.failing("a child parented before the layer first draws lands at the composed position", async () => {
    const at = compose([P0], [0]);
    await mountCycle(handle.page, "3d/scene", props([P0], 0), (page) =>
      expectChildAt(page, at)
    );
  });

  // The cases below mount the child unparented (so the defect above does not
  // apply) and parent it once it is drawn.

  it("a parent's translation and scale compose onto the child", async () => {
    // (20, -10) + 2 * (5, 5) = (30, 0), half 8 → pixels x [122, 138],
    // y [92, 108] around (130, 100).
    const local = compose([], []);
    const at = compose([P0], [0]);
    await mountCycle(handle.page, "3d/scene", props([P0], null), async (page) => {
      await expectChildAt(page, local);
      await update(page, props([P0], 0));
      await eventually(page, async () => {
        await expectChildAt(page, at);
        await expectGoneFrom(page, local);
      });
    });
  });

  it("a grandparent composes too", async () => {
    // P1 under P0: (20, -10) + 2 * ((-40, 30) + (5, 5)) = (-50, 60), half 8.
    const parents = [P0, { ...P1, parent: 0 }];
    const at = compose(parents, [1, 0]);
    await mountCycle(handle.page, "3d/scene", props(parents, null), async (page) => {
      await update(page, props(parents, 1));
      await eventually(page, () => expectChildAt(page, at));
    });
  });

  it("moving the parent moves the child", async () => {
    const moved: ParentSpec = { ...P0, position: [-30, 20, 0] };
    const before = compose([P0], [0]);
    const after = compose([moved], [0]);
    await mountCycle(handle.page, "3d/scene", props([P0], null), async (page) => {
      await update(page, props([P0], 0));
      await eventually(page, () => expectChildAt(page, before));
      await update(page, props([moved], 0));
      await eventually(page, async () => {
        await expectChildAt(page, after);
        await expectGoneFrom(page, before);
      });
    });
  });

  it("re-parenting moves the child to the new parent's frame", async () => {
    const parents = [P0, P1];
    const under0 = compose(parents, [0]);
    // (-40, 30) + (5, 5) = (-35, 35), half 4.
    const under1 = compose(parents, [1]);
    await mountCycle(handle.page, "3d/scene", props(parents, null), async (page) => {
      await update(page, props(parents, 0));
      await eventually(page, () => expectChildAt(page, under0));
      await update(page, props(parents, 1));
      await eventually(page, async () => {
        await expectChildAt(page, under1);
        await expectGoneFrom(page, under0);
      });
    });
  });

  it("removing the parent removes the child's pixels from the composed position", async () => {
    // Detached, the child is back at its local (5, 5), half 4.
    const composed = compose([P0], [0]);
    const local = compose([], []);
    await mountCycle(handle.page, "3d/scene", props([P0], null), async (page) => {
      await update(page, props([P0], 0));
      await eventually(page, () => expectChildAt(page, composed));
      await update(page, props([P0], null));
      await eventually(page, async () => {
        await expectGoneFrom(page, composed);
        await expectChildAt(page, local);
      });
    });
  });

  it("removing the child instance clears the canvas", async () => {
    const composed = compose([P0], [0]);
    await mountCycle(handle.page, "3d/scene", props([P0], null), async (page) => {
      await update(page, props([P0], 0));
      await eventually(page, () => expectChildAt(page, composed));
      await update(page, { ...props([P0], 0), instances: [] });
      await eventually(page, () => expectGoneFrom(page, composed));
      await expectAllClear(page);
    });
  });
});
