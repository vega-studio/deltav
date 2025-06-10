import { GLSettings, ILayerProps, IShaderInitialization, Layer, Vec3 } from "../../../../src";
import { SimpleMeshInstance } from "./simple-mesh-instance.js";
export interface ISimpleMeshLayerProps<TInstance extends SimpleMeshInstance> extends ILayerProps<TInstance> {
    /** The mesh vertices (array of Vec3) */
    vertices: Vec3[];
    /** The mesh normals (array of Vec3) */
    normals: Vec3[];
}
/**
 * Layer for rendering a simple mesh with Phong lighting
 */
export declare class SimpleMeshLayer<TInstance extends SimpleMeshInstance, TProps extends ISimpleMeshLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ISimpleMeshLayerProps<SimpleMeshInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    /**
     * Layer must be rebuilt if the vertices change.
     */
    willUpdateProps(newProps: ISimpleMeshLayerProps<TInstance>): void;
    getMaterialOptions(): Partial<import("../../../../src").Omit<import("../../../../src").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">> & {
        modify(options: import("../../../../src").ILayerMaterialOptions): Omit<import("../../../../src").CommonMaterial, "modify>">;
    } & {
        cullSide: GLSettings.Material.CullSide;
    };
}
