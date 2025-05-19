import type { Vec2 } from "../../../src/math/index.js";
export interface IPerlinOptions {
    /** Output width */
    width: number;
    /** Output height */
    height: number;
    /** The amount of blurring to apply to the combined octaves */
    blendPasses: number;
    /**
     * An octave is the start of perlin noise with a gaussian noise map. Each octave should be smaller
     * than the end result. The octave is then scaled up then averaged with the
     * other octaves. Octaves closer to the output size creates greater detail in regions, while
     * octaves that are smaller creates larger features.
     *
     * Octaves are in the format [width, height]
     */
    octaves: Vec2[];
    /**
     * This sets the values that should appear within the perlin dataset.
     */
    valueRange: Vec2;
}
/**
 * This generates a 2d plane of perlin noise that is gray scale with values
 * that are 0 - 1.
 */
export declare class PerlinNoise {
    /** The blurring kernal used to blur the data */
    private blur;
    /** The perlin data with values 0 - 1 */
    data: number[][];
    /** Used for debug rendering the output */
    private debugContext;
    /** The options used to construct the data */
    options: IPerlinOptions;
    get width(): number;
    get height(): number;
    /**
     * Provide the output size, and the size of the octaves generated.
     */
    constructor(options: IPerlinOptions);
    /**
     * Generates a new perlin dataset
     */
    generate(): Promise<void>;
    /**
     * Will just ensure the data object is populated with a generation.
     */
    generateOnce(): Promise<void>;
    /**
     * Retrieves a rectangular sample from the perlin data.
     * If a threshold is included, absolute values below it will be zero'ed out.
     */
    sample(x: number, y: number, width: number, height: number, threshold?: number): number[][];
    /**
     * Update the options for the noise generation.
     */
    update(options: Partial<IPerlinOptions>): void;
    /**
     * Renders a canvas on the screen showing the generated output.
     */
    debug(threshold?: number, clear?: boolean): void;
}
