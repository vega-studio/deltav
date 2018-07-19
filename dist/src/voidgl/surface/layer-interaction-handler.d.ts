import { Instance } from '../instance-provider/instance';
import { IPoint } from '../primitives/point';
import { IColorPickingData, IProjection } from '../types';
import { ILayerProps, Layer } from './layer';
/**
 * This manages mouse gestures broadcast to the layer and handles appropriate actions such as determining
 * how to make the interaction translate to picking events for the layer's instances.
 *
 * This class, in summary, takes in the gestures to the view and converts them to gestures to the instances.
 */
export declare class LayerInteractionHandler<T extends Instance, U extends ILayerProps<T>> {
    /** This is the color picking information most recently rendered */
    colorPicking?: IColorPickingData;
    /** This tracks the elements that have the mouse currently over them */
    isMouseOver: Map<T, boolean>;
    /** This tracks the elements the mouse was down on */
    isMouseDown: Map<T, boolean>;
    /** This is the layer the interaction handler manages events for */
    layer: Layer<T, U>;
    constructor(layer: Layer<T, U>);
    /**
     * Retrieves the color picking instance determined for the procedure.
     */
    getColorPickInstance(): T | null | undefined;
    /**
     * Handles mouse down gestures for a layer within a view
     */
    handleMouseOver(view: IProjection, mouse: IPoint): void;
    /**
     * Handles mouse down gestures for a layer within a view
     */
    handleMouseDown(view: IProjection, mouse: IPoint, button: number): void;
    /**
     * Handles mouse out events for a layer within the view
     */
    handleMouseOut(view: IProjection, mouse: IPoint): void;
    /**
     * Handles mouse up gestures for the layer within the provided view
     */
    handleMouseUp(view: IProjection, mouse: IPoint, button: number): void;
    /**
     * Mouse move events on the layer will detect when instances have their item newly over or just moved on
     */
    handleMouseMove(view: IProjection, mouse: IPoint): void;
    /**
     * Handles click gestures on the layer within a view
     */
    handleMouseClick(view: IProjection, mouse: IPoint, button: number): void;
    /**
     * Handles drag gestures for the layer within the view
     */
    handleMouseDrag(view: IProjection, mouse: IPoint): void;
}
