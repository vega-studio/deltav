import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, IProjection } from '../../types';
import { Vec } from '../../util';
import { IAutoEasingMethod } from '../../util/auto-easing-method';
import { CircleInstance } from './circle-instance';
export interface ICircleLayerProps extends ILayerProps<CircleInstance> {
    /** This sets the  */
    fadeOutOversized?: number;
    /** This sets a scaling factor for the circle's radius */
    scaleFactor?(): number;
    /** Flags this layer to draw  */
    disableDepthTest?: boolean;
    /**
     * This is the properties that can toggle on animations.
     *
     * NOTE: The more properties declared as animated will reduce the performance of the layer.
     * if animated properties are created, it can be beneficial to have other layers with no
     * animations be available for the Instances to 'rest' in when not moving.
     */
    animate?: {
        center?: IAutoEasingMethod<Vec>;
        radius?: IAutoEasingMethod<Vec>;
        color?: IAutoEasingMethod<Vec>;
    };
}
/**
 * This layer displays circles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class CircleLayer extends Layer<CircleInstance, ICircleLayerProps> {
    static defaultProps: ICircleLayerProps;
    /**
     * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
     * of elements
     */
    getInstancePickingMethods(): {
        boundsAccessor: (circle: CircleInstance) => Bounds;
        hitTest: (circle: CircleInstance, point: IPoint, view: IProjection) => boolean;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<CircleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
