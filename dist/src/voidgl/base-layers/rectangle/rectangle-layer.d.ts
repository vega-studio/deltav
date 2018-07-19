import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, IShaderInitialization, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection } from "../../types";
import { RectangleInstance } from "./rectangle-instance";
export interface IRectangleLayerProps extends ILayerProps<RectangleInstance> {
    atlas?: string;
}
export declare class RectangleLayer extends Layer<RectangleInstance, IRectangleLayerProps> {
    getInstancePickingMethods(): {
        boundsAccessor: (rectangle: RectangleInstance) => Bounds;
        hitTest: (rectangle: RectangleInstance, point: IPoint, projection: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<RectangleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
