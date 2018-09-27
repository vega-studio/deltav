import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import { IMaterialOptions, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { ArcInstance } from "./arc-instance";
export declare enum ArcScaleType {
    NONE = 0,
    SCREEN_CURVE = 1
}
export interface IArcLayerProps<T extends ArcInstance> extends ILayerProps<T> {
    scaleType?: ArcScaleType;
    animate?: {
        colorStart?: IAutoEasingMethod<Vec>;
        colorEnd?: IAutoEasingMethod<Vec>;
    };
}
export declare class ArcLayer<T extends ArcInstance, U extends IArcLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IArcLayerProps<ArcInstance>;
    initShader(): IShaderInitialization<ArcInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}