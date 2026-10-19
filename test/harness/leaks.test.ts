import { afterEach, describe, expect, it, test } from "@jest/globals";

import { useFixturePage } from "./browser.js";
import { RESOURCE_KINDS } from "./host-api.js";
import { expectNoLeaks, snapshotResources } from "./leaks.js";
import { mountCycle } from "./mount-cycle.js";
import {
  expectOutside,
  expectRegion,
  rgba01To255,
  worldRectToPixel2D,
} from "./probe.js";

/**
 * Controls for the leak detector: fixtures that leak on purpose must fail
 * expectNoLeaks with a report naming what leaked, fixtures that clean up must
 * pass, and the real deltav target goes through mountCycle.
 */
const CLEAR: [number, number, number, number] = [0, 0, 0, 1];
const BLUE: [number, number, number, number] = [0.2, 0.4, 1, 1];
const SIZE = { width: 200, height: 150 };

describe("leak detector controls", () => {
  const handle = useFixturePage();

  afterEach(async () => {
    await handle.page.evaluate(() => window.__deltav!.unmount());
    handle.page.errors.length = 0;
  });

  async function mountAndUnmount(name: string) {
    const { page } = handle;
    await page.evaluate((n) => window.__deltav!.mount(n), name);
    await page.evaluate(() => window.__deltav!.unmount());
  }

  it("snapshots every resource kind", async () => {
    const snap = await snapshotResources(handle.page);
    for (const kind of RESOURCE_KINDS) {
      expect(typeof snap[kind]).toBe("number");
    }
    expect(typeof snap.seq).toBe("number");
  });

  it("reports the buffer, texture and context of leaky-raw", async () => {
    const { page } = handle;
    const baseline = await snapshotResources(page);
    await mountAndUnmount("leak-control/leaky-raw");

    const error = await expectNoLeaks(page, baseline).then(
      () => null,
      (e: Error) => e
    );
    expect(error).not.toBeNull();
    const message = error!.message;
    expect(message).toMatch(/buffers: \+1/);
    expect(message).toMatch(/textures: \+1/);
    expect(message).toMatch(/contexts: \+1/);
    // Nothing else: mounting a React root adds no tracked listener.
    expect(message).not.toMatch(/^\s*(listeners|canvases|frame\w+): /m);
    expect(message).toMatch(/- buffer \(context #\d+\)/);
    expect(message).toMatch(/- texture \(context #\d+\)/);
    // The creation stack points into the fixture that leaked.
    expect(message).toMatch(/raw-gl/);
  });

  it("passes clean-raw, which deletes everything and loses its context", async () => {
    const { page } = handle;
    const baseline = await snapshotResources(page);
    await mountAndUnmount("leak-control/clean-raw");
    await expectNoLeaks(page, baseline);
    expect(page.errors).toEqual([]);
  });

  it("passes clean-raw through mountCycle", async () => {
    await mountCycle(
      handle.page,
      "leak-control/clean-raw",
      {},
      async (page) => {
        const snap = await snapshotResources(page);
        expect(snap.contexts).toBeGreaterThan(0);
      }
    );
  });

  it("reports the window listener of leaky-listener by type", async () => {
    const { page } = handle;
    const baseline = await snapshotResources(page);
    await mountAndUnmount("leak-control/leaky-listener");

    await expect(expectNoLeaks(page, baseline)).rejects.toThrow(
      /listeners: \+1[\s\S]*window:deltav-leak-control/
    );
  });

  it("tolerates exactly what `allow` names", async () => {
    const { page } = handle;
    const baseline = await snapshotResources(page);
    await mountAndUnmount("leak-control/leaky-listener");

    // Not a defect: this control proves `allow` itself.
    await expectNoLeaks(page, baseline, { allow: { listeners: 1 } });
    await expect(
      expectNoLeaks(page, baseline, { allow: { buffers: 1 } })
    ).rejects.toThrow(/listeners/);
  });

  it("fails mountCycle on a leaking fixture", async () => {
    await expect(
      mountCycle(handle.page, "leak-control/leaky-raw", {}, () => {
        /* nothing to probe */
      })
    ).rejects.toThrow(/buffers: \+1/);
  });

  // DEFECT: SurfaceJSX unmount leaks GL objects and its context — fixed by step-04
  test.failing("deltav-minimal survives mountCycle without leaks", async () => {
    const world = { x: 20, y: 30, width: 80, height: 50 };
    await mountCycle(
      handle.page,
      "leak-control/deltav-minimal",
      {
        ...SIZE,
        clear: CLEAR,
        position: [world.x, world.y],
        size: [world.width, world.height],
        color: BLUE,
      },
      async (page) => {
        const pixels = worldRectToPixel2D(world);
        await expectRegion(page, pixels, rgba01To255(BLUE));
        await expectOutside(page, pixels, rgba01To255(CLEAR));
      }
    );
  });
});
