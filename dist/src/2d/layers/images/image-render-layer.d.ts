import { ILayerMaterialOptions, IShaderInitialization } from "../../../types";
import { IAutoEasingMethod, Vec } from "../../../util";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d";
import { ImageInstance } from "./image-instance";
export interface IImageRenderLayerProps<T extends ImageInstance> extends ILayer2DProps<T> {
    atlas?: string;
    animate?: {
        tint?: IAutoEasingMethod<Vec>;
        location?: IAutoEasingMethod<Vec>;
        size?: IAutoEasingMethod<Vec>;
    };
    rasterizationScale?: number;
}
export declare class ImageRenderLayer<T extends ImageInstance, U extends IImageRenderLayerProps<T>> extends Layer2D<T, U> {
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
    initShader(): IShaderInitialization<ImageInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
