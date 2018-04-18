import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, IProjection } from '../../types';
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
     * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
     * of elements
     */
    getInstancePickingMethods(): {
        boundsAccessor: (o: CircleInstance) => Bounds;
        hitTest: (o: CircleInstance, p: IPoint, view: IProjection) => boolean;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<CircleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
