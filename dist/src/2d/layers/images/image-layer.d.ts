import { InstanceProvider } from "../../../instance-provider";
import { AtlasResource, IAtlasResourceRequest } from "../../../resources";
import { LayerInitializer } from "../../../surface/layer";
import { Layer2D } from "../../view/layer-2d";
import { ImageInstance } from "./image-instance";
import { IImageRenderLayerProps } from "./image-render-layer";
export interface IImageLayerProps<T extends ImageInstance> extends IImageRenderLayerProps<T> {
}
export declare type ImageVideoResource = {
    /**
     * IF AND ONLY IF the browser supports it. This will cause the video to begin playing immediately when ready and
     * loaded. This merely prevents the need to add video.play() to something after onReady has been called. All other
     * expected video patterns are expected to apply.
     */
    autoPlay?: boolean;
    /**
     * This is the source the video will load.
     */
    videoSrc: string;
};
export declare type ImageInstanceResource = string | ImageBitmap | ImageData | HTMLImageElement | HTMLCanvasElement | ImageVideoResource;
/**
 * Typeguard for video resource requests
 */
export declare function isVideoResource(val: any): val is ImageVideoResource;
/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways. This is the primary handler for image instances.
 */
export declare class ImageLayer<T extends ImageInstance, U extends IImageLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IImageLayerProps<any>;
    /** Internal provider for child layers for this layer to hand off to */
    childProvider: InstanceProvider<ImageInstance>;
    /**
     * This tracks which resource this image is associated with This allows us to know what resource an image
     * moves on from, thus allowing us to dispatch a disposal request of the resource.
     */
    imageToResource: Map<ImageInstance, AtlasResource>;
    /** The cached property ids of the instances so they are not processed every draw */
    propertyIds?: {
        [key: string]: number;
    };
    /** We can consolidate requests at this layer level to reduce memory footprint of requests */
    sourceToRequest: Map<AtlasResource, IAtlasResourceRequest>;
    /** Map video resource requests to their corresponding video element */
    sourceToVideo: Map<string, HTMLVideoElement>;
    /**
     * Stores a lookup to see which instances are using a video source. This helps track when the video source is no
     * longer in use and can be disposed.
     */
    usingVideo: Map<string, Set<ImageInstance>>;
    /**
     * These are the instances waiting for a video source to finish loading and have valid dimensions to be used by the
     * resource manager.
     */
    waitingForVideo: Map<string, Set<ImageInstance>>;
    /**
     * Instance lookup to see which video source the instance is waiting on.
     */
    waitForVideoSource: Map<ImageInstance, string>;
    /**
     * In cases where the image has a special case loading procedure like videos, the image will have it's onReady
     */
    originalOnReadyCallbacks: Map<ImageInstance, ((image: ImageInstance, video?: HTMLVideoElement | undefined) => void) | undefined>;
    /**
     * The image layer will manage the resources for the images, and the child layer will concern itself
     * with rendering.
     */
    childLayers(): LayerInitializer[];
    destroy(): void;
    /**
     * Hijack the draw method to control changes to the source so we can send the manager dispose requests
     * of a given image.
     */
    draw(): void;
    /**
     * Gets the source that is atlas reques compatible.
     */
    private getAtlasSource;
    /**
     * This handles creating the video object from the source. It then queues up the waiting needs and temporarily
     * converts the video Image to a simple white image that will take on the tint of the ImageInstance.
     */
    private prepareVideo;
    /**
     * This asserts whether or not the layer should be triggering redraws or not.
     */
    private updateAnimationState;
    /**
     * Parent layer has no rendering needs
     */
    initShader(): null;
}
