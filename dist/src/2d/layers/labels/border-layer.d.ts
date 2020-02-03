import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { ILayer2DProps, Layer2D } from "../../view";
import { BorderInstance } from "./border-instance";
export interface IBorderLayerProps<T extends BorderInstance> extends ILayer2DProps<T> {
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
    };
    atlas?: string;
    /** Scale factor determining the scale size of the border */
    scaleFactor?(): number;
}
/**
 * This layer displays Borders and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class BorderLayer<T extends BorderInstance, U extends IBorderLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IBorderLayerProps<BorderInstance>;
    static attributeNames: {
        anchor: string;
        color: string;
        depth: string;
        fontScale: string;
        location: string;
        maxScale: string;
        scale: string;
        scaling: string;
        size: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<BorderInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
