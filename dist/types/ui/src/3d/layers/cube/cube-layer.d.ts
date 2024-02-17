import { CubeInstance } from "./cube-instance";
import { IShaderInitialization } from "../../../types";
import { GLSettings } from "../../../gl";
import { ILayerProps, Layer } from "../../../surface/layer";
export interface ICubeLayerProps<TInstance extends CubeInstance> extends ILayerProps<TInstance> {
}
/**
 * Layer for rendering simple cube primitives
 */
export declare class CubeLayer<TInstance extends CubeInstance, TProps extends ICubeLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ICubeLayerProps<CubeInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    getMaterialOptions(): Partial<import("../../../types").Omit<import("../../../gl").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">> & {
        modify(options: Partial<import("../../../types").Omit<import("../../../gl").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">>): Omit<import("../../../util").CommonMaterial, "modify>">;
    } & {
        cullSide: GLSettings.Material.CullSide;
    };
}
