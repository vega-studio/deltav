import { GLSettings, ILayerProps, IShaderInitialization, Layer } from "../../../../src";
import { CubeInstance } from "./cube-instance";
export interface ICubeLayerProps<TInstance extends CubeInstance> extends ILayerProps<TInstance> {
}
/**
 * Layer for rendering simple cube primitives
 */
export declare class CubeLayer<TInstance extends CubeInstance, TProps extends ICubeLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ICubeLayerProps<CubeInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    getMaterialOptions(): Partial<import("../../../../src").Omit<import("../../../../src").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">> & {
        modify(options: Partial<import("../../../../src").Omit<import("../../../../src").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">>): Omit<import("../../../../src").CommonMaterial, "modify>">;
    } & {
        cullSide: GLSettings.Material.CullSide;
    };
}
