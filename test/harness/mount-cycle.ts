import type { FixturePage } from "./browser.js";
import type { FixtureProps } from "./host-api.js";
import {
  expectNoLeaks,
  type ExpectNoLeaksOptions,
  snapshotResources,
} from "./leaks.js";

export interface MountCycleOptions extends ExpectNoLeaksOptions {
  /** Mount/check/unmount rounds (default 2: build, break down, rebuild). */
  cycles?: number;
}

/**
 * The breakdown-and-rebuild cycle every feature test runs (D6): takes a
 * resource baseline, then `cycles` times mounts the fixture, runs `check`,
 * unmounts and asserts no leak against that baseline. Finally asserts the page
 * logged no error.
 */
export async function mountCycle(
  page: FixturePage,
  fixture: string,
  props: FixtureProps,
  check: (page: FixturePage, cycle: number) => Promise<void> | void,
  options: MountCycleOptions = {}
): Promise<void> {
  const { cycles = 2, ...leakOptions } = options;
  const baseline = await snapshotResources(page);

  for (let cycle = 0; cycle < cycles; ++cycle) {
    await page.evaluate(
      ({ fixture, props }) => window.__deltav!.mount(fixture, props),
      { fixture, props }
    );
    try {
      await check(page, cycle);
    } finally {
      await page.evaluate(() => window.__deltav!.unmount());
    }
    await expectNoLeaks(page, baseline, leakOptions);
  }

  if (page.errors.length > 0) {
    throw new Error(`The page logged errors:\n${page.errors.join("\n")}`);
  }
}
