import { InstanceProvider } from "../../../instance-provider";
import { AtlasResource, IAtlasResourceRequest } from "../../../resources";
import { LayerInitializer } from "../../../surface/layer";
import { Layer2D } from "../../view/layer-2d";
import { ImageInstance } from "./image-instance";
import { IImageRenderLayerProps } from "./image-render-layer";
export interface IImageLayerProps<T extends ImageInstance> extends IImageRenderLayerProps<T> {
}
export declare type ImageVideoResource = {
    autoPlay?: boolean;
    videoSrc: string;
};
export declare type ImageInstanceResource = string | ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | ImageVideoResource;
export declare function isVideoResource(val: any): val is ImageVideoResource;
export declare class ImageLayer<T extends ImageInstance, U extends IImageLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IImageLayerProps<any>;
    childProvider: InstanceProvider<ImageInstance>;
    imageToResource: Map<ImageInstance, AtlasResource>;
    propertyIds?: {
        [key: string]: number;
    };
    sourceToRequest: Map<AtlasResource, IAtlasResourceRequest>;
    sourceToVideo: Map<string, HTMLVideoElement>;
    usingVideo: Map<string, Set<ImageInstance>>;
    waitingForVideo: Map<string, Set<ImageInstance>>;
    waitForVideoSource: Map<ImageInstance, string>;
    originalOnReadyCallbacks: Map<ImageInstance, ((image: ImageInstance, video?: HTMLVideoElement | undefined) => void) | undefined>;
    childLayers(): LayerInitializer[];
    destroy(): void;
    draw(): void;
    private getAtlasSource;
    private prepareVideo;
    initShader(): null;
}
