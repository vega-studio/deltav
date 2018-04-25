import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, IProjection } from '../../types';
import { EdgeInstance } from './edge-instance';
export declare enum EdgeType {
    /** Makes a straight edge with no curve */
    LINE = 0,
    /** Makes a single control point Bezier curve */
    BEZIER = 1,
    /** Makes a two control point bezier curve */
    BEZIER2 = 2,
}
export interface IEdgeLayerProps extends ILayerProps<EdgeInstance> {
    /** Specifies how the edge is formed */
    type: EdgeType;
}
export interface IEdgeLayerState {
}
/**
 * This layer displays edges and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class EdgeLayer extends Layer<EdgeInstance, IEdgeLayerProps, IEdgeLayerState> {
    static defaultProps: IEdgeLayerProps;
    /**
     * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
     * of elements
     */
    getInstancePickingMethods(): {
        boundsAccessor: (edge: EdgeInstance) => Bounds;
        hitTest: (edge: EdgeInstance, point: IPoint, view: IProjection) => boolean;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<EdgeInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}