import { ILayerProps, IModelType, IPickingMethods, Layer } from "../../surface/layer";
import { IMaterialOptions, IShaderInitialization } from "../../types";
import { EdgeInstance } from "./edge-instance";
import { EdgeBroadphase, EdgeScaleType, EdgeType } from "./types";
export interface IEdgeLayerProps<T extends EdgeInstance> extends ILayerProps<T> {
    broadphase?: EdgeBroadphase;
    minPickDistance?: number;
    scaleFactor?(): number;
    scaleType?: EdgeScaleType;
    type: EdgeType;
}
export interface IEdgeLayerState {
}
export declare class EdgeLayer<T extends EdgeInstance, U extends IEdgeLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IEdgeLayerProps<EdgeInstance>;
    getInstancePickingMethods(): IPickingMethods<EdgeInstance>;
    initShader(): IShaderInitialization<EdgeInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
