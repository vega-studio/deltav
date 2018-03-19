import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions } from '../../types';
import { CircleInstance } from './circle-instance';
export interface ICircleLayerProps extends ILayerProps<CircleInstance> {
}
export interface ICircleLayerState {
}
/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class CircleLayer extends Layer<CircleInstance, ICircleLayerProps, ICircleLayerState> {
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<CircleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
