import {
  cloneClientRect,
  DOMRectBounds,
  DOMRectPadding,
} from "./clone-client-rect.js";

const NO_BOUNDS = (): DOMRectBounds => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
});

/**
 * Calculates a ClientRect that is relative to another client rect.
 */
export function relativeClientRect(
  source?: DOMRectBounds,
  relativeTo?: DOMRectBounds,
  padding?: DOMRectPadding
) {
  if (!source) return relativeTo || NO_BOUNDS();
  if (!relativeTo) return source || NO_BOUNDS();
  const a = cloneClientRect(source, padding);

  a.top -= relativeTo.top;
  a.bottom -= relativeTo.top;
  a.left -= relativeTo.left;
  a.right -= relativeTo.left;

  return a || NO_BOUNDS();
}
