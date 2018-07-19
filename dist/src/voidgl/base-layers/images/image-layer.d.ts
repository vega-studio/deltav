import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, IShaderInitialization, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection } from "../../types";
import { ImageInstance } from "./image-instance";
export interface IImageLayerProps extends ILayerProps<ImageInstance> {
    atlas?: string;
}
export declare class ImageLayer extends Layer<ImageInstance, IImageLayerProps> {
    getInstancePickingMethods(): {
        boundsAccessor: (image: ImageInstance) => Bounds;
        hitTest: (image: ImageInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<ImageInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
