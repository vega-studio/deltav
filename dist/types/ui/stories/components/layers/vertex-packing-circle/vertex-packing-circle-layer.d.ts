import { ILayer2DProps, ILayerMaterialOptions, IShaderInitialization, Layer2D } from "../../../../src/index.js";
import type { VertexPackingCircleInstance } from "./vertex-packing-circle-instance.js";
export interface IVertexPackingCircleLayerProps<T extends VertexPackingCircleInstance> extends ILayer2DProps<T> {
    /** Opacity of the layer as a whole */
    opacity?(): number;
}
/**
 * This layer renders:
 * A poorly optimized circle that causes vertex packing to happen in the buffer
 * management (there is more vertex information than available vertex attributes
 * thus causing multiple vertex atttributes to be packed into a single vertex.)
 */
export declare class VertexPackingCircleLayer<T extends VertexPackingCircleInstance, U extends IVertexPackingCircleLayerProps<T>> extends Layer2D<T, U> {
    static defaultProps: IVertexPackingCircleLayerProps<VertexPackingCircleInstance>;
    static attributeNames: {
        center: string;
        color: string;
        color2: string;
        depth: string;
        radius: string;
    };
    /**
     * Define our shader and it's inputs
     */
    initShader(): IShaderInitialization<VertexPackingCircleInstance>;
    getMaterialOptions(): ILayerMaterialOptions;
}
