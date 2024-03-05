/// <reference types="react" />
import { ILayerMaterialOptions } from "../../../../types";
import { IPartialViewJSX } from "../../scene/view-jsx";
import { IView2DProps } from "../../../../2d";
import type { Vec2 } from "../../../../math";
export interface ITrailJSX {
    /**
     * Specifies the texture that has the previous trail and the texture to add to
     * the trail.
     */
    input: {
        trail: string;
        add: string;
    };
    /**
     * This specifies the texture to render the new trail to. If not provided,
     * this will render to the screen.
     */
    output: string;
    /** For debugging only. Prints generated shader to the console. */
    printShader?: boolean;
    /** Options to send to the view */
    view?: IPartialViewJSX<IView2DProps>;
    /**
     * Allows you to control material options such as blend modes of the post
     * process effect.
     */
    material?: ILayerMaterialOptions;
    /**
     * The trailing effect's intensity. 1 means infinite trail. 0 means no trail
     */
    intensity?: number;
    /** The name to apply to the scenes this effect produces */
    name: string;
    /**
     * When provided the trails will drift in a direction over time. Like a wind
     * blowing effect
     */
    drift?: {
        /** Direction + magnitude the trail will drift */
        direction: Vec2;
        /**
         * Resource texture containing the vector field that will distort the trail
         */
        vectorField?: string;
    };
}
/**
 * Applies a trailing effect by doing a non-clearing additive effect of another
 * texture. Then applies the result to the trail texture slightly faded.
 */
export declare function TrailJSX(props: ITrailJSX): import("react").JSX.Element[];
