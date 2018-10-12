import { ILayerProps, IModelType, IPickingMethods, Layer } from "../../surface/layer";
import { IMaterialOptions, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { EdgeInstance } from "./edge-instance";
import { EdgeBroadphase, EdgeScaleType, EdgeType } from "./types";
export interface IEdgeLayerProps<T extends EdgeInstance> extends ILayerProps<T> {
    animate?: {
        end?: IAutoEasingMethod<Vec>;
        start?: IAutoEasingMethod<Vec>;
        colorStart?: IAutoEasingMethod<Vec>;
        colorEnd?: IAutoEasingMethod<Vec>;
        control?: IAutoEasingMethod<Vec>;
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
        start: string;
        end: string;
        widthStart: string;
        widthEnd: string;
        depth: string;
        colorStart: string;
        colorEnd: string;
        control: string;
    };
    getInstancePickingMethods(): IPickingMethods<EdgeInstance>;
    initShader(): IShaderInitialization<EdgeInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
