import { GLSettings, ILayerProps, IShaderInitialization, Layer } from "../../../../src";
import { SurfaceTileInstance } from "./surface-tile-instance";
export declare class SurfaceTileLayer extends Layer<SurfaceTileInstance, ILayerProps<SurfaceTileInstance>> {
    static defaultProps: ILayerProps<SurfaceTileInstance>;
    static attributeNames: {
        c1: string;
        c2: string;
        c3: string;
        c4: string;
    };
    initShader(): IShaderInitialization<SurfaceTileInstance>;
    getMaterialOptions(): Partial<import("../../../../src").Omit<import("../../../../src").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">> & {
        modify(options: Partial<import("../../../../src").Omit<import("../../../../src").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">>): Omit<import("../../../../src").CommonMaterial, "modify>">;
    } & {
        cullSide: GLSettings.Material.CullSide;
    };
}
