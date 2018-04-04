import { ILayerProps, IMaterialOptions, IModelType, IShaderInitialization, Layer } from '../../index';
import { RingInstance } from './ring-instance';
export interface IRingLayerProps extends ILayerProps<RingInstance> {
}
export interface IRingLayerState {
}
/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class RingLayer extends Layer<RingInstance, IRingLayerProps, IRingLayerState> {
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<RingInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
