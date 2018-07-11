import { DataBounds } from "../util/data-bounds";
import { Bounds } from "./bounds";

/**
 * Anytime this is used to express bounds of an object, it is expected
 * to behave like CSS styling with absolute positioning.
 *
 * Setting a left and a right will auto calculate width (setting width takes precedence)
 *
 * You can set numbers to a %. If no % is present all other characters will be ignored
 * (px, em, and other dimensions will not be supported...just px by default unless %)
 */
export type AbsolutePosition = {
  bottom?: number | string;
  height?: number | string;
  left?: number | string;
  right?: number | string;
  top?: number | string;
  width?: number | string;
};

function value(val: number | string, ref: number, scaleRatio: number) {
  const parse = `${val}`;
  const num = parseFloat(parse);

  if (isNaN(num)) {
    return 0;
  }

  // If this is a percentage use the reference as the num to multiply against
  if (parse.indexOf("%") > -1) {
    return num / 100.0 * ref;
  }

  return num * scaleRatio;
}

/**
 * This evaluates an absolute position with a reference to produce meaningful bounds.
 *
 * The scaleRatio provided should be available in or for percents to have the same weighting
 * as whole number values.
 */
export function getAbsolutePositionBounds<T>(
  item: AbsolutePosition,
  reference: Bounds,
  scaleRatio: number
): DataBounds<T> {
  if (reference.width === 0 || reference.height === 0) {
    console.warn(
      "An AbsolutePosition evaluated to invalid dimensions.",
      "Please ensure that the object provided and the reference has valid dimensions",
      "to produce dimensions with width and height that are non-zero.",
      "item:",
      item,
      "reference:",
      reference.toString()
    );
  }

  const bounds = DataBounds.emptyBounds<T>();
  let width;
  let height;

  // Calculate the horizontal values
  if (item.width) {
    bounds.width = value(item.width, reference.width, scaleRatio);

    if (item.left !== undefined) {
      bounds.x = value(item.left, reference.width, scaleRatio);
    } else if (item.right !== undefined) {
      bounds.x =
        reference.width -
        value(item.right, reference.width, scaleRatio) -
        bounds.width;
    }
  } else {
    const left = value(item.left || 0, reference.width, scaleRatio);
    const right =
      reference.width - value(item.right || 0, reference.width, scaleRatio);
    width = right - left;

    if (width < 0) {
      console.warn(
        "An AbsolutePosition evaluated to invalid dimensions.",
        "Please ensure that the object provided and the reference has valid dimensions",
        "to produce dimensions with width and height that are greater than zero.",
        "item:",
        item,
        "reference:",
        reference.toString()
      );
    }

    bounds.x = left;
    bounds.width = width;
  }

  // Calculate the vertical values
  if (item.height) {
    bounds.height = value(item.height, reference.height, scaleRatio);

    if (item.top !== undefined) {
      bounds.y = value(item.top, reference.height, scaleRatio);
    } else if (item.bottom !== undefined) {
      bounds.y =
        reference.height -
        value(item.bottom, reference.height, scaleRatio) -
        bounds.height;
    }
  } else {
    const top = value(item.top || 0, reference.height, scaleRatio);
    const bottom =
      reference.height - value(item.bottom || 0, reference.height, scaleRatio);
    height = bottom - top;

    if (height === undefined || height < 0) {
      console.warn(
        "An AbsolutePosition evaluated to invalid dimensions.",
        "Please ensure that the object provided and the reference has valid dimensions",
        "to produce dimensions with width and height that are greater than zero.",
        "item:",
        item,
        "reference:",
        reference.toString()
      );
    }

    bounds.y = top;
    bounds.height = height;
  }

  if (
    bounds.width === 0 ||
    bounds.height === 0 ||
    isNaN(bounds.x + bounds.y + bounds.width + bounds.height)
  ) {
    bounds.x = 0;
    bounds.y = 0;
    bounds.width = reference.width;
    bounds.height = reference.height;
  }

  return bounds;
}
