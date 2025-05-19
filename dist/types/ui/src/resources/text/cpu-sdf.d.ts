import { Vec2 } from "../../math/vector.js";
/**
 * Redraws the contents of the provided canvas as a signed distance field.
 * Signed distance fields are great for many techniques.
 *
 * As of right now this SDF merely represents distance to nearest occupied
 * pixel.
 *
 * This  particular SDF calculation utilizes JFA
 *
 * This algortihm follows the following:
 * Make a buffer that is the size of the canvas and seed it with values equal to the pixel position of filled pixels
 * Next calculate how many passes JFA will need to run based on the size of the canvas: log_2(max dimension of the canvas)
 * Next sample the buffer in a 3x3 grid with each having an offset that is 2^(number of passes - current pass - 1). The center
 * sample is the current pixel.
 * Each sample will contain either NO DATA or will contain the pixel position of the nearest filled pixel.
 * Each sample will calculate the distance of the sample to the current pixel position, the nearest sample will fill the buffer at
 * that position.
 *
 * After all passes, the buffer should be filled with the nearest pixel positions. You can take that and map it to either distances
 * or use other techniques desired.
 */
export declare function convertToSDF(canvas: HTMLCanvasElement, mapMethod?: (toSeedBuffer: Vec2[][], fromSeedBuffer: Vec2[][], noDataObject: Vec2, outData: Uint8ClampedArray) => void): void;
/**
 * Makes a SDF of the input font specified
 */
export declare function makeFontSDF(_canvas: HTMLCanvasElement): void;
