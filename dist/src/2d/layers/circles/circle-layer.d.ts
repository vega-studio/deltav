import { Vec } from "../../../math";
import { IAutoEasingMethod } from "../../../math/auto-easing-method";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { CircleInstance } from "./circle-instance";
export interface ICircleLayerProps<T extends CircleInstance> extends ILayer2DProps<T> {
    /**
     * This is the properties that can toggle on animations.
     *
     * NOTE: The more properties declared as animated will reduce the performance of the layer.
     * if animated properties are created, it can be beneficial to have other layers with no
     * animations be available for the Instances to 'rest' in when not moving.
     */
    animate?: {
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
    };
    /** This sets a scaling factor for the circle's radius */
    scaleFactor?(): number;
    /** Opacity of the layer as a whole */
    opacity?(): number;
    /**
     * When set, this causes the circles to be rendered utilizing the hardware POINTS mode. POINTS mode has limitations:
     * Different GPUs have different MAX POINT SIZE values, so the points can only be rendered up to a certain size. Also
     * points can have unexpected culling that occurs at the edge of the viewport.
     *
     * However, this mode has GREATLY improved performance when utilized correctly. So use for the correct situation, but
     * beware it's weak 'points' <- this is a pun in the comments of this code base. <- this is me being over zealous in
     * clarifying so the apostraphes don't lead to unecessary conclusions.
     */
    usePoints?: boolean;
}
/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class CircleLayer<T extends CircleInstance, U extends ICircleLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: ICircleLayerProps<CircleInstance>;
    static attributeNames: {
        center: string;
        color: string;
        depth: string;
        radius: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<CircleInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
