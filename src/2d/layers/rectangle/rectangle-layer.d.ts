import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { IAutoEasingMethod, Vec } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { RectangleInstance } from "./rectangle-instance";
export interface IRectangleLayerProps<T extends RectangleInstance> extends ILayer2DProps<T> {
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
    };
    scaleFactor?(): number;
}
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
    };
    initShader(): IShaderInitialization<RectangleInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
