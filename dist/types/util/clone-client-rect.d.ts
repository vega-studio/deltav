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
export declare function cloneClientRect(box?: DOMRectBounds, padding?: DOMRectPadding): DOMRectBounds;
