import { Instance2D } from "../../../3d/scene-graph/instance-2d.js";
import { type ILayer2DProps, type IRenderTextureResource, type IShaderInitialization, Layer2D, type OutputFragmentShaderSource } from "../../../index.js";
export interface IVertexPointsLayerProps extends ILayer2DProps<Instance2D> {
    /** The number of points that will be rendered. */
    numPoints: number;
    /**
     * The vertex shader to use for the layer. This is standard layer vertex
     */
    vs: string;
    /**
     * The fragment shader to use for the layer. This is standard layer fragment
     * shader declaration so multiple outputs can be specified for MRT.
     */
    fs: OutputFragmentShaderSource;
    /**
     * When this is provided a UV texture coordinate will be provided so a
     * particle can sample it's data from a texture
     */
    dataSourceSize?: {
        /**
         * The name of the vector2 attribute that will store the UV texture
         * coordinate
         */
        attributeName: string;
        /** Width of the data source texture */
        width: number;
        /** Height of the data source texture */
        height: number;
    };
    /**
     * It is common to need texture resources to make these types of processes
     * work. This allows you to specify a map of
     *
     * <name in shader> to <resource key>
     *
     * to make your shaders more robust.
     *
     * Use an array of resources to automatically swap the resources every render
     * in the order the resources are listed in the array.
     */
    resources?: Record<string, IRenderTextureResource | IRenderTextureResource[] | undefined>;
}
/**
 * This layer allows you to specify a vertex buffer with a custmized amount of
 * vertices. You can then use the vertices to be manipulated by a custome vs and
 * fs shader for any purposes.
 *
 * This is intended to make working with float texture based particle systems
 * easier to implement.
 */
export declare class VertexPointsLayer extends Layer2D<Instance2D, IVertexPointsLayerProps> {
    static defaultProps: IVertexPointsLayerProps;
    initShader(): IShaderInitialization<Instance2D>;
    getMaterialOptions(): import("../../../index.js").CommonMaterial;
}
