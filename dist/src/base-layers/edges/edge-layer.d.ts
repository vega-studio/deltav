import { ILayerProps, IPickingMethods, Layer } from "../../surface/layer";
import { ILayerMaterialOptions, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { EdgeInstance } from "./edge-instance";
import { EdgeBroadphase, EdgeScaleType, EdgeType } from "./types";
export interface IEdgeLayerProps<T extends EdgeInstance> extends ILayerProps<T> {
    animate?: {
        end?: IAutoEasingMethod<Vec>;
        start?: IAutoEasingMethod<Vec>;
        startColor?: IAutoEasingMethod<Vec>;
        endColor?: IAutoEasingMethod<Vec>;
        control?: IAutoEasingMethod<Vec>;
        thickness?: IAutoEasingMethod<Vec>;
    };
    broadphase?: EdgeBroadphase;
    minPickDistance?: number;
    opacity?: number;
    scaleFactor?(): number;
    scaleType?: EdgeScaleType;
    type: EdgeType;
}
export interface IEdgeLayerState {
}
export declare class EdgeLayer<T extends EdgeInstance, U extends IEdgeLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IEdgeLayerProps<EdgeInstance>;
    static attributeNames: {
        control: string;
        depth: string;
        end: string;
        endColor: string;
        start: string;
        startColor: string;
        thickness: string;
    };
    getInstancePickingMethods(): IPickingMethods<EdgeInstance>;
    initShader(): IShaderInitialization<EdgeInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
