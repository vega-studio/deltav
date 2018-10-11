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
        angle?: IAutoEasingMethod<Vec>;
        center?: IAutoEasingMethod<Vec>;
        colorEnd?: IAutoEasingMethod<Vec>;
        colorStart?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        thickness?: IAutoEasingMethod<Vec>;
    };
}
export declare class ArcLayer<T extends ArcInstance, U extends IArcLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IArcLayerProps<ArcInstance>;
    static attributeNames: {
        angle: string;
        center: string;
        colorEnd: string;
        colorStart: string;
        depth: string;
        radius: string;
        thickness: string;
    };
    initShader(): IShaderInitialization<ArcInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
