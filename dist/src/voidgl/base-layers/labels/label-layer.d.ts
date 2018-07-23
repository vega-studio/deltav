import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { LabelInstance } from "./label-instance";
export interface ILabelLayerProps<T extends LabelInstance> extends ILayerProps<T> {
    atlas?: string;
}
export declare class LabelLayer<T extends LabelInstance, U extends ILabelLayerProps<T>> extends Layer<T, U> {
    getInstancePickingMethods(): {
        boundsAccessor: (label: LabelInstance) => Bounds;
        hitTest: (label: LabelInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<LabelInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
