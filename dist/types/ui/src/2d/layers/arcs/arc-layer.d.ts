import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types.js";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d.js";
import { ArcInstance } from "./arc-instance.js";
export declare enum ArcScaleType {
    /** All dimensions are within world space */
    NONE = 0,
    /**
     * The thickness of the arc is in screen space. Thus, camera zoom changes will not affect it and
     * must be controlled by scaleFactor alone.
     */
    SCREEN_CURVE = 1
}
export interface IArcLayerProps<T extends ArcInstance> extends ILayer2DProps<T> {
    scaleType?: ArcScaleType;
    animate?: {
        angle?: IAutoEasingMethod<Vec>;
        angleOffset?: IAutoEasingMethod<Vec>;
        center?: IAutoEasingMethod<Vec>;
        colorEnd?: IAutoEasingMethod<Vec>;
        colorStart?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        thickness?: IAutoEasingMethod<Vec>;
    };
}
/**
 * This layer displays Arcs and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class ArcLayer<T extends ArcInstance, U extends IArcLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IArcLayerProps<ArcInstance>;
    /** Easy lookup of all attribute names for the layer */
    static attributeNames: {
        angle: string;
        angleOffset: string;
        center: string;
        colorEnd: string;
        colorStart: string;
        depth: string;
        radius: string;
        thickness: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<ArcInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
