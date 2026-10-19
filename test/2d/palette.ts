/**
 * The 2D suite's palette, 0–1 RGBA. Every channel is a multiple of 51/255, so
 * its byte value is exact, and every pair of colours (the clear colour
 * included) differs by at least 64/255 on some channel (D4).
 */
export type RGBA01 = [number, number, number, number];

/** The clear colour of every 2D fixture view: opaque black. */
export const CLEAR: RGBA01 = [0, 0, 0, 1];
export const RED: RGBA01 = [1, 0.2, 0.2, 1];
export const BLUE: RGBA01 = [0.2, 0.4, 1, 1];
export const GREEN: RGBA01 = [0.2, 1, 0.4, 1];
export const YELLOW: RGBA01 = [1, 1, 0.2, 1];
export const MAGENTA: RGBA01 = [1, 0.2, 1, 1];
export const WHITE: RGBA01 = [1, 1, 1, 1];

/** Every fixture canvas of the 2D suite is this size. */
export const CANVAS = { width: 200, height: 200 };
