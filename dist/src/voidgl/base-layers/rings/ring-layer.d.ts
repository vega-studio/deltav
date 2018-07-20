import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { RingInstance } from "./ring-instance";
export interface IRingLayerProps<T extends RingInstance> extends ILayerProps<T> {
    scaleFactor?(): number;
}
export declare class RingLayer<T extends RingInstance, U extends IRingLayerProps<T>> extends Layer<T, U> {
    getInstancePickingMethods(): {
        boundsAccessor: (ring: RingInstance) => Bounds;
        hitTest: (ring: RingInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<RingInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
