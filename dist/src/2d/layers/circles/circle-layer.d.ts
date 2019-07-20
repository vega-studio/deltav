import { Vec } from "../../../math";
import { IAutoEasingMethod } from "../../../math/auto-easing-method";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { CircleInstance } from "./circle-instance";
export interface ICircleLayerProps<T extends CircleInstance> extends ILayer2DProps<T> {
    animate?: {
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
    };
    scaleFactor?(): number;
    opacity?(): number;
    usePoints?: boolean;
}
export declare class CircleLayer<T extends CircleInstance, U extends ICircleLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: ICircleLayerProps<CircleInstance>;
    static attributeNames: {
        center: string;
        color: string;
        depth: string;
        radius: string;
    };
    initShader(): IShaderInitialization<CircleInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
