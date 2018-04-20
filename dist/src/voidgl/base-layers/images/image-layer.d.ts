import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, IProjection } from '../../types';
import { ImageInstance } from './image-instance';
export interface IImageLayerProps extends ILayerProps<ImageInstance> {
    atlas?: string;
}
export interface IImageLayerState {
}
/**
 * This layer displays Images and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class ImageLayer extends Layer<ImageInstance, IImageLayerProps, IImageLayerState> {
    /**
     * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
     * of elements
     */
    getInstancePickingMethods(): {
        boundsAccessor: (image: ImageInstance) => Bounds;
        hitTest: (image: ImageInstance, point: IPoint, view: IProjection) => boolean;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<ImageInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
