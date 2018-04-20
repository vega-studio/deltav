import { IPoint } from '../primitives/point';
import { IProjection } from '../types';
import { Instance } from '../util';
import { ILayerProps, Layer } from './layer';
/**
 * This manages mouse gestures broadcast to the layer and handles appropriate actions such as determining
 * how to make the interaction translate to picking events for the layer's instances.
 *
 * This class, in summary, takes in the gestures to the view and converts them to gestures to the instances.
 */
export declare class LayerInteractionHandler<T extends Instance, U extends ILayerProps<T>, V> {
    /** This tracks the elements that have the mouse currently over them */
    isMouseOver: Map<T, boolean>;
    /** This tracks the elements the mouse was down on */
    isMouseDown: Map<T, boolean>;
    /** This is the layer the interaction handler manages events for */
    layer: Layer<T, U, V>;
    constructor(layer: Layer<T, U, V>);
    /**
     * Handles mouse down gestures for a layer within a view
     */
    handleMouseOver(view: IProjection, mouse: IPoint): void;
    /**
     * Handles mouse down gestures for a layer within a view
     */
    handleMouseDown(view: IProjection, mouse: IPoint): void;
    /**
     * Handles mouse out events for a layer within the view
     */
    handleMouseOut(view: IProjection, mouse: IPoint): void;
    /**
     * Handles mouse up gestures for the layer within the provided view
     */
    handleMouseUp(view: IProjection, mouse: IPoint): void;
    /**
     * Mouse move events on the layer will detect when instances have their item newly over or just moved on
     */
    handleMouseMove(view: IProjection, mouse: IPoint): void;
    /**
     * Handles click gestures on the layer within a view
     */
    handleMouseClick(view: IProjection, mouse: IPoint): void;
    /**
     * Handles drag gestures for the layer within the view
     */
    handleMouseDrag(view: IProjection, mouse: IPoint): void;
}
