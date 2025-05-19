import { Bounds } from "./bounds.js";
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
/**
 * This evaluates an absolute position with a reference to produce meaningful bounds.
 *
 * The scaleRatio provided should be available in or for percents to have the same weighting
 * as whole number values.
 */
export declare function getAbsolutePositionBounds<T>(item: AbsolutePosition, reference: Bounds<any>, scaleRatio: number): Bounds<T>;
