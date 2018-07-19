import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, IShaderInitialization, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection } from "../../types";
import { RingInstance } from "./ring-instance";
export interface IRingLayerProps extends ILayerProps<RingInstance> {
    scaleFactor?(): number;
}
export declare class RingLayer extends Layer<RingInstance, IRingLayerProps> {
    getInstancePickingMethods(): {
        boundsAccessor: (ring: RingInstance) => Bounds;
        hitTest: (ring: RingInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<RingInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
