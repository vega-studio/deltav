import { InstanceProvider } from "../../instance-provider";
import { IAtlasResourceRequest } from "../../resources";
import { Layer } from "../../surface/layer";
import { LayerInitializer } from "../../surface/surface";
import { ImageInstance } from "./image-instance";
import { IImageRenderLayerProps } from "./image-render-layer";
export interface IImageLayerProps<T extends ImageInstance> extends IImageRenderLayerProps<T> {
}
export declare class ImageLayer<T extends ImageInstance, U extends IImageLayerProps<T>> extends Layer<T, U> {
    static defaultProps: IImageLayerProps<any>;
    childProvider: InstanceProvider<ImageInstance>;
    imageToResource: Map<ImageInstance, string | HTMLCanvasElement | ImageBitmap | ImageData | HTMLImageElement | HTMLVideoElement>;
    propertyIds?: {
        [key: string]: number;
    };
    sourceToRequest: Map<string | HTMLCanvasElement | ImageBitmap | ImageData | HTMLImageElement | HTMLVideoElement, IAtlasResourceRequest>;
    childLayers(): LayerInitializer[];
    draw(): void;
    initShader(): null;
}
