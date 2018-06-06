import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, IProjection } from '../../types';
import { RingInstance } from './ring-instance';
export interface IRingLayerProps extends ILayerProps<RingInstance> {
    /** This sets a scaling factor for the circle's radius */
    scaleFactor?(): number;
}
export interface IRingLayerState {
}
/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class RingLayer extends Layer<RingInstance, IRingLayerProps, IRingLayerState> {
    /**
     * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
     * of elements
     */
    getInstancePickingMethods(): {
        boundsAccessor: (ring: RingInstance) => Bounds;
        hitTest: (ring: RingInstance, point: IPoint, view: IProjection) => boolean;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<RingInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
