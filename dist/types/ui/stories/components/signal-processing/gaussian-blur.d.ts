export interface IGaussianBlurOptions {
    /** Number of samples taken per data slot */
    kernalSize: number;
    /** Number of times the blur is applied */
    passes: number;
}
/**
 * Performs a gaussian blur on a set of numerical data.
 */
export declare class GaussianBlur {
    private kernal;
    options: IGaussianBlurOptions;
    constructor(options: IGaussianBlurOptions);
    /**
     * Applies the blur to the input data, returns a blurred version without affecting the source.
     */
    generate(data: number[][], offsetLeft?: number, offsetTop?: number, offsetRight?: number, offsetBottom?: number): number[][];
    update(options: Partial<IGaussianBlurOptions>): void;
}
