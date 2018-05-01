import { ILayerProps, IModelType, IPickingMethods, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions } from '../../types';
import { EdgeInstance } from './edge-instance';
import { EdgeBroadphase, EdgeScaleType, EdgeType } from './types';
export interface IEdgeLayerProps extends ILayerProps<EdgeInstance> {
    /** Allows adjustments for broadphase interactions for an edge */
    broadphase?: EdgeBroadphase;
    /** Any distance to the mouse from an edge that is less than this distance will be picked */
    minPickDistance?: number;
    /** This sets a scaling factor for the edge's line width and curve  */
    scaleFactor?(): number;
    /**
     * If this is set, then the thickness of the line and the curvature of the line exists in screen space
     * rather than world space.
     */
    scaleType?: EdgeScaleType;
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
    getInstancePickingMethods(): IPickingMethods<EdgeInstance>;
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<EdgeInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
