import type { Page } from "playwright-core";

import { annotateFrames } from "./bundle-frames.js";
import {
  type LeakDetails,
  RESOURCE_KINDS,
  type ResourceCounts,
  type ResourceKind,
  type ResourceSnapshot,
} from "./host-api.js";

/** Frames expectNoLeaks waits for asynchronous teardown before it fails. */
export const LEAK_SETTLE_FRAMES = 10;

/** Creation stacks shown per leaked kind. */
const STACKS_PER_KIND = 3;
/** Frames shown per creation stack. */
const FRAMES_PER_STACK = 8;

export interface ExpectNoLeaksOptions {
  /**
   * Extra live resources tolerated per kind. Only for a documented, reported
   * defect (D7): a test that passes `allow` must carry a `// DEFECT:` comment.
   */
  allow?: Partial<ResourceCounts>;
  /** Frames to wait for teardown before failing (default 10). */
  frames?: number;
}

/** Reads the page's live resource counts (`window.__deltavLeaks.snapshot()`). */
export async function snapshotResources(page: Page): Promise<ResourceSnapshot> {
  return page.evaluate(() => {
    if (!window.__deltavLeaks) {
      throw new Error(
        "window.__deltavLeaks is missing: the host page must import test/harness/leaks-page.ts first"
      );
    }
    return window.__deltavLeaks.snapshot();
  });
}

/** Kinds whose count grew past the baseline by more than `allow` permits. */
export function diffResources(
  baseline: ResourceSnapshot,
  current: ResourceSnapshot,
  allow: Partial<ResourceCounts> = {}
): { kind: ResourceKind; leaked: number }[] {
  const leaks: { kind: ResourceKind; leaked: number }[] = [];
  for (const kind of RESOURCE_KINDS) {
    const leaked = current[kind] - baseline[kind];
    if (leaked > (allow[kind] || 0)) leaks.push({ kind, leaked });
  }
  return leaks;
}

/** Formats a leak report: each leaked kind, its count and its first stacks. */
export function formatLeakReport(
  leaks: { kind: ResourceKind; leaked: number }[],
  details: LeakDetails
): string {
  const lines = ["Resources leaked since the baseline:"];
  for (const { kind, leaked } of leaks) {
    lines.push(`  ${kind}: +${leaked}`);
    const entries = details[kind] || [];
    for (const e of entries.slice(0, STACKS_PER_KIND)) {
      lines.push(`    - ${e.label}`);
      for (const frame of e.stack.split("\n")) {
        if (frame) lines.push(`      | ${frame}`);
      }
    }
    if (entries.length > STACKS_PER_KIND) {
      lines.push(`    … ${entries.length - STACKS_PER_KIND} more`);
    }
  }
  return lines.join("\n");
}

/**
 * Names the source module of each frame of the creation stacks (the page is
 * one bundle, see bundle-frames.ts) and drops the leak instrument's own frames.
 */
async function annotateStacks(details: LeakDetails): Promise<void> {
  for (const entries of Object.values(details)) {
    for (const e of (entries || []).slice(0, STACKS_PER_KIND)) {
      e.stack = (await annotateFrames(e.stack))
        .filter((frame) => !frame.includes("leaks-page"))
        .slice(0, FRAMES_PER_STACK)
        .join("\n");
    }
  }
}

/**
 * Asserts that nothing counted by the leak instrument outlived the baseline.
 * Waits up to `frames` animation frames (deltav destroys some resources
 * asynchronously), then throws a report naming each leaked kind, its count and
 * the first three creation stacks.
 */
export async function expectNoLeaks(
  page: Page,
  baseline: ResourceSnapshot,
  options: ExpectNoLeaksOptions = {}
): Promise<void> {
  const frames = options.frames ?? LEAK_SETTLE_FRAMES;
  let leaks = diffResources(
    baseline,
    await snapshotResources(page),
    options.allow
  );

  for (let i = 0; i < frames && leaks.length > 0; ++i) {
    await page.evaluate(() => window.__deltav!.waitFrames(1));
    leaks = diffResources(
      baseline,
      await snapshotResources(page),
      options.allow
    );
  }

  if (leaks.length === 0) return;

  const details = await page.evaluate(
    (since) => window.__deltavLeaks!.details(since),
    baseline.seq
  );
  await annotateStacks(details);
  throw new Error(formatLeakReport(leaks, details));
}
