import { Bounds } from "../../math/primitives";
import { ILayerProps, Layer } from "../../surface/layer";
import { ILayerMaterialOptions, IProjection, IShaderInitialization } from "../../types";
import { IAutoEasingMethod, Vec } from "../../util";
import { ImageInstance } from "./image-instance";
export interface IImageRenderLayerProps<T extends ImageInstance> extends ILayerProps<T> {
    atlas?: string;
    animate?: {
        tint?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
        size?: IAutoEasingMethod<Vec>;
    };
    rasterizationScale?: number;
}
export declare class ImageRenderLayer<T extends ImageInstance, U extends IImageRenderLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IImageRenderLayerProps<any>;
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
        boundsAccessor: (image: ImageInstance) => Bounds<{}>;
        hitTest: (image: ImageInstance, point: [number, number], view: IProjection) => boolean;
    };
    initShader(): IShaderInitialization<ImageInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
