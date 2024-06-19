export declare class PascalTriangle {
    /** Contains the triangles elements [[1], [1, 1], [1, 2, 1], etc] */
    elements: number[][];
    constructor(levels: number);
    /**
     * Tries to generate a gaussian kernal based on the pascal triangle where the kernal has so many elements
     * To get a higher quality kernal trim off the ends of the triangle's row but keep the kernal number.
     * This causes a deeper triangle to be calculated.
     */
    gaussianKernal(size: number, trim: number): {
        kernal: number[];
        total: number;
    };
}
