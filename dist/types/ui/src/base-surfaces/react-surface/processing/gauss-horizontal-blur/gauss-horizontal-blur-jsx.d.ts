export interface IGaussHorizontalBlurJSX {
    /** Specifies the resource taken in that will be blurred for the output */
    input: string;
    /**
     * Specifies an output resource key to send the results to. If passes is > 1
     * an output is REQUIRED as the inut and output will reverse per pass to ping
     * pong the results.
     */
    output?: string;
    /** For debugging only. Prints generated shader to the console. */
    printShader?: boolean;
    /** A name applied to the scenes this produces */
    name: string;
}
/**
 * Performs a gaussian horizontal blur on a resource and outputs to a specified
 * resource.
 */
export declare function GaussHorizontalBlurJSX(props: IGaussHorizontalBlurJSX): import("react").JSX.Element;
