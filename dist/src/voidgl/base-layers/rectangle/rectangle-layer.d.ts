import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { RectangleInstance } from "./rectangle-instance";
export interface IRectangleLayerProps<T extends RectangleInstance> extends ILayerProps<T> {
    atlas?: string;
}
export declare class RectangleLayer<T extends RectangleInstance, U extends IRectangleLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IRectangleLayerProps<RectangleInstance>;
    static attributeNames: {
        location: string;
        anchor: string;
        size: string;
        depth: string;
        scaling: string;
        color: string;
    };
    getInstancePickingMethods(): {
        boundsAccessor: (rectangle: RectangleInstance) => Bounds;
        hitTest: (rectangle: RectangleInstance, point: IPoint, projection: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<RectangleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
