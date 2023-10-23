/**
 * Padding values to grow a client rect during a client rect cloning operation.
 */
export type DOMRectPadding = {
  left?: number;
  top?: number;
  bottom?: number;
  right?: number;
};

export type DOMRectBounds = {
  x: number;
  y: number;
  top: number;
  left: number;
  bottom: number;
  right: number;
  width: number;
  height: number;
};

/**
 * ClientRects are a bit annoying to work around their immutability if needed.
 * This properly makes a Mutable clone without altering the original (unless
 * padding is specified to do a one time change of the bounds. The padding
 * expands/contracts the box on the indicated sides).
 */
export function cloneClientRect(
  box?: DOMRectBounds,
  padding?: DOMRectPadding
): DOMRectBounds {
  if (!box) {
    return {
      x: 0,
      y: 0,
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
    };
  }

  let { top, right, bottom, left, width, height } = box;

  if (padding) {
    if (padding.left) {
      left -= padding.left;
      width += padding.left;
    }

    if (padding.right) {
      right += padding.right;
      width += padding.right;
    }

    if (padding.top) {
      top -= padding.top;
      height += padding.top;
    }

    if (padding.bottom) {
      bottom += padding.bottom;
      height += padding.bottom;
    }
  }

  return { x: left, y: top, top, right, bottom, left, width, height };
}
