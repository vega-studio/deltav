/// <reference types="react" />
import { ILayerMaterialOptions } from "../../../../types";
import { IPartialViewJSX } from "../../scene/view-jsx";
import { IView2DProps } from "../../../../2d";
export declare enum BoxSampleJSXDirection {
    DOWN = 0,
    UP = 1
}
export interface IBoxSampleJSX {
    /** Name to apply to the scenes this produces */
    name: string;
    /** Specifies the resource taken in that will be blurred for the output */
    input: string;
    /** Specifies an output resource key to send the results to */
    output?: string;
    /** For debugging only. Prints generated shader to the console. */
    printShader?: boolean;
    /** Set for down or up sampling */
    direction: BoxSampleJSXDirection;
    /** Options to send to the view */
    view?: IPartialViewJSX<IView2DProps>;
    /**
     * Allows you to control material options such as blend modes of the post
     * process effect.
     */
    material?: ILayerMaterialOptions;
}
/**
 * Performs downsampling or upsampling of an image by utilizing the linear
 * interpolation properties of texture samplong using the GPU.
 */
export declare function BoxSampleJSX(props: IBoxSampleJSX): import("react").JSX.Element;
