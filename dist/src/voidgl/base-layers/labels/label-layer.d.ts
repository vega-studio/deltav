import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions } from '../../types';
import { LabelInstance } from './label-instance';
export interface ILabelLayerProps extends ILayerProps<LabelInstance> {
    atlas?: string;
}
export interface ILabelLayerState {
}
/**
 * This layer displays Labels and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class LabelLayer extends Layer<LabelInstance, ILabelLayerProps, ILabelLayerState> {
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<LabelInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
