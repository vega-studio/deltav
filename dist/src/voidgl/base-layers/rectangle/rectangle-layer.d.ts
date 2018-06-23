import { Bounds, IPoint } from '../../primitives';
import { ILayerProps, IModelType, IShaderInitialization, Layer } from '../../surface/layer';
import { IMaterialOptions, IProjection } from '../../types';
import { RectangleInstance } from './rectangle-instance';
export interface IRectangleLayerProps extends ILayerProps<RectangleInstance> {
    atlas?: string;
}
/**
 * This layer displays Rectangles and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class RectangleLayer extends Layer<RectangleInstance, IRectangleLayerProps> {
    /**
     * We provide bounds and hit test information for the instances for this layer to allow for mouse picking
     * of elements
     */
    getInstancePickingMethods(): {
        boundsAccessor: (rectangle: RectangleInstance) => Bounds;
        hitTest: (rectangle: RectangleInstance, point: IPoint, projection: IProjection) => boolean;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<RectangleInstance>;
    getModelType(): IModelType;
    getMaterialOptions(): IMaterialOptions;
}
