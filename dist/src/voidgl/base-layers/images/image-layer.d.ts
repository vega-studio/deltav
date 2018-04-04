import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions } from '../../types';
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
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<ImageInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
