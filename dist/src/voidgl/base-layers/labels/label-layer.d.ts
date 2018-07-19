import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, IShaderInitialization, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection } from "../../types";
import { LabelInstance } from "./label-instance";
export interface ILabelLayerProps extends ILayerProps<LabelInstance> {
    atlas?: string;
}
export declare class LabelLayer extends Layer<LabelInstance, ILabelLayerProps> {
    getInstancePickingMethods(): {
        boundsAccessor: (label: LabelInstance) => Bounds;
        hitTest: (label: LabelInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<LabelInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
