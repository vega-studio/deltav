import { Bounds, IPoint } from "../../primitives";
import { ILayerProps, IModelType, Layer } from "../../surface/layer";
import { IMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { ImageInstance } from "./image-instance";
export interface IImageLayerProps<T extends ImageInstance> extends ILayerProps<T> {
    atlas?: string;
    animate?: {
        tint?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
        size?: IAutoEasingMethod<Vec>;
    };
}
export declare class ImageLayer<T extends ImageInstance, U extends IImageLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IImageLayerProps<any>;
    static attributeNames: {
        location: string;
        anchor: string;
        size: string;
        depth: string;
        scaling: string;
        texture: string;
        tint: string;
    };
    getInstancePickingMethods(): {
        boundsAccessor: (image: ImageInstance) => Bounds;
        hitTest: (image: ImageInstance, point: IPoint, view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<ImageInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
