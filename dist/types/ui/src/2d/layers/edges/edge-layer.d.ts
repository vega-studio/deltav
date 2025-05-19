import { IAutoEasingMethod, Vec } from "../../../math";
import { ILayerMaterialOptions, IShaderInitialization } from "../../../types.js";
import { ILayer2DProps, Layer2D } from "../../view/layer-2d.js";
import { EdgeInstance } from "./edge-instance.js";
import { EdgeBroadphase, EdgeScaleType, EdgeType } from "./types.js";
export interface IEdgeLayerProps<T extends EdgeInstance> extends ILayer2DProps<T> {
    /** Properties for animating attributes */
    animate?: {
        end?: IAutoEasingMethod<Vec>;
        start?: IAutoEasingMethod<Vec>;
        startColor?: IAutoEasingMethod<Vec>;
        endColor?: IAutoEasingMethod<Vec>;
        control?: IAutoEasingMethod<Vec>;
        thickness?: IAutoEasingMethod<Vec>;
    };
    /** Allows adjustments for broadphase interactions for an edge */
    broadphase?: EdgeBroadphase;
    /** Any distance to the mouse from an edge that is less than this distance will be picked */
    minPickDistance?: number;
    /** The transparency of the layer as a whole. (Makes for very efficient fading of all elements) */
    opacity?: number;
    /** This sets a scaling factor for the edge's line width and curve  */
    scaleFactor?(): number;
    /**
     * If this is set, then the thickness of the line and the curvature of the line exists in screen space
     * rather than world space.
     */
    scaleType?: EdgeScaleType;
    /** Specifies how the edge is formed */
    type: EdgeType;
    /**
     * Specifiy how many segments to render curved lines with. This defaults to 50
     * the higher the number, the less likely it is to see jagged curves, but
     * performance will drop.
     */
    smoothness?: number;
}
export interface IEdgeLayerState {
}
/**
 * This layer displays edges and provides as many controls as possible for displaying
 * them in interesting ways.
 */
export declare class EdgeLayer<T extends EdgeInstance, U extends IEdgeLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IEdgeLayerProps<EdgeInstance>;
    static attributeNames: {
        control: string;
        depth: string;
        end: string;
        endColor: string;
        start: string;
        startColor: string;
        thickness: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<EdgeInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
