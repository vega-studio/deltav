import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { ImageInstance } from "./image-instance";
export interface IImageLayerProps<T extends ImageInstance> extends ILayerProps<T> {
    atlas?: string;
}
export declare class ImageLayer<T extends ImageInstance, U extends IImageLayerProps<T>> extends Layer<T, U> {
    getInstancePickingMethods(): {
        boundsAccessor: (image: ImageInstance) => Bounds;
        hitTest: (image: ImageInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<ImageInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
