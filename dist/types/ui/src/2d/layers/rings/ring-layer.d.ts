import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types.js";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d.js";
import { RingInstance } from "./ring-instance.js";
export interface IRingLayerProps<T extends RingInstance> extends ILayer2DProps<T> {
    /** This sets a scaling factor for the circle's radius */
    scaleFactor?(): number;
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
    };
}
/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class RingLayer<T extends RingInstance, U extends IRingLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IRingLayerProps<RingInstance>;
    static attributeNames: {
        center: string;
        radius: string;
        depth: string;
        color: string;
        thickness: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<RingInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
