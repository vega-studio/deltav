import { ILayerProps, IShaderInitialization, Layer } from "../../../../src";
import { CubeInstance } from "./cube-instance.js";
export interface ICubeLightingLayerProps<TInstance extends CubeInstance> extends ILayerProps<TInstance> {
    fake?: string;
}
/**
 * Layer for rendering simple cube primitives
 */
export declare class CubeLightingLayer<TInstance extends CubeInstance, TProps extends ICubeLightingLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ICubeLightingLayerProps<CubeInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    getMaterialOptions(): Partial<import("../../../../src").Omit<import("../../../../src").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">>;
}
