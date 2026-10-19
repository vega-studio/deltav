import type { RectsHandle } from "../fixtures/interaction/handles.js";
import type { FixturePage } from "../harness/browser.js";

/**
 * Calls a method of the rects fixture's in-page handle
 * (`window.__dvInteractionRects`) through page.evaluate.
 */
export function callRects<K extends keyof RectsHandle>(
  page: FixturePage,
  method: K,
  ...args: Parameters<RectsHandle[K]>
): Promise<ReturnType<RectsHandle[K]>> {
  return page.evaluate(
    ({ method, args }) => {
      const handle = window.__dvInteractionRects;
      if (!handle) throw new Error("interaction/rects is not mounted");
      return (handle[method] as (...a: unknown[]) => unknown)(...args);
    },
    { method, args: args as unknown[] }
  ) as Promise<ReturnType<RectsHandle[K]>>;
}
