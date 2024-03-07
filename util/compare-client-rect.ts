import { DOMRectBounds } from "./clone-client-rect.js";

/**
 * Compares two client rects against each other.
 */
export function compareClientRect(
  a?: DOMRectBounds | null,
  b?: DOMRectBounds | null
) {
  if (!a && !b) return true;
  if (!a && b) return false;
  if (a && !b) return false;

  // This should never happen, but it does make TS happy.
  if (!a || !b) return false;

  return (
    a === b ||
    (a.top === b.top &&
      a.left === b.left &&
      a.right === b.right &&
      a.bottom === b.bottom &&
      a.width === b.width &&
      a.height === b.height)
  );
}
