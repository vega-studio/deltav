import { ILayerProps, IModelType, IPickingMethods, IShaderInitialization, Layer } from "../../surface/layer";
import { IMaterialOptions } from "../../types";
import { EdgeInstance } from "./edge-instance";
import { EdgeBroadphase, EdgeScaleType, EdgeType } from "./types";
export interface IEdgeLayerProps extends ILayerProps<EdgeInstance> {
    broadphase?: EdgeBroadphase;
    minPickDistance?: number;
    scaleFactor?(): number;
    scaleType?: EdgeScaleType;
    type: EdgeType;
}
export interface IEdgeLayerState {
}
export declare class EdgeLayer extends Layer<EdgeInstance, IEdgeLayerProps> {
    static defaultProps: IEdgeLayerProps;
    getInstancePickingMethods(): IPickingMethods<EdgeInstance>;
    initShader(): IShaderInitialization<EdgeInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
