import { GLSettings } from "../../../gl";
import { ILayerProps, Layer } from "../../../surface/layer.js";
import { IShaderInitialization } from "../../../types.js";
import { TriangleInstance } from "./triangle-instance.js";
export interface ITriangleLayerProps<TInstance extends TriangleInstance> extends ILayerProps<TInstance> {
}
/**
 * Layer for rendering simple Triangle primitives
 */
export declare class TriangleLayer<TInstance extends TriangleInstance, TProps extends ITriangleLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ITriangleLayerProps<TriangleInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    getMaterialOptions(): Partial<import("../../../types.js").Omit<import("../../../gl").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">> & {
        modify(options: import("../../../types.js").ILayerMaterialOptions): Omit<import("../../../util").CommonMaterial, "modify>">;
    } & {
        cullSide: GLSettings.Material.CullSide;
    };
}
