export interface IGaussVerticalBlurJSX {
    /** Specifies the resource taken in that will be blurred for the output */
    input: string;
    /** Specifies an output resource key to send the results to */
    output?: string;
    /** For debugging only. Prints generated shader to the console. */
    printShader?: boolean;
    /** Name for the scenes this produces */
    name: string;
}
/**
 * Performs a gaussian vertical blur on a resource and outputs to a specified
 * resource.
 */
export declare function GaussVerticalBlurJSX(props: IGaussVerticalBlurJSX): import("react").JSX.Element;
