import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, IProjection } from '../../types';
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
     * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
     * of elements
     */
    getInstancePickingMethods(): {
        boundsAccessor: (label: LabelInstance) => Bounds;
        hitTest: (label: LabelInstance, point: IPoint, view: IProjection) => boolean;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<LabelInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
