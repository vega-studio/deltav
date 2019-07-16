import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { IAutoEasingMethod, Vec } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { RingInstance } from "./ring-instance";
export interface IRingLayerProps<T extends RingInstance> extends ILayer2DProps<T> {
    scaleFactor?(): number;
    animate?: {
        color?: IAutoEasingMethod<Vec>;
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
    };
}
export declare class RingLayer<T extends RingInstance, U extends IRingLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IRingLayerProps<RingInstance>;
    static attributeNames: {
        center: string;
        radius: string;
        depth: string;
        color: string;
        thickness: string;
    };
    initShader(): IShaderInitialization<RingInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
