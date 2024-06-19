import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { RectangleInstance } from "./rectangle-instance";
export interface IRectangleLayerProps<T extends RectangleInstance> extends ILayer2DProps<T> {
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
        size?: IAutoEasingMethod<Vec>;
        outline?: IAutoEasingMethod<Vec>;
        outlineColor?: IAutoEasingMethod<Vec>;
    };
    /** Scale factor determining the scale size of the rectangle */
    scaleFactor?(): number;
}
/**
 * This layer displays Rectangles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class RectangleLayer<T extends RectangleInstance, U extends IRectangleLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IRectangleLayerProps<RectangleInstance>;
    static attributeNames: {
        anchor: string;
        color: string;
        depth: string;
        location: string;
        maxScale: string;
        scale: string;
        scaling: string;
        size: string;
        outline: string;
        outlineColor: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<RectangleInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
