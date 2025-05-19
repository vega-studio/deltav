import { GLSettings } from "../../../gl";
import { ILayerProps, Layer } from "../../../surface/layer.js";
import { IShaderInitialization } from "../../../types.js";
import { CubeInstance } from "./cube-instance.js";
export interface ICubeLayerProps<TInstance extends CubeInstance> extends ILayerProps<TInstance> {
}
/**
 * Layer for rendering simple cube primitives
 */
export declare class CubeLayer<TInstance extends CubeInstance, TProps extends ICubeLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ICubeLayerProps<CubeInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    getMaterialOptions(): Partial<import("../../../types.js").Omit<import("../../../gl").MaterialOptions, "fragmentShader" | "uniforms" | "vertexShader">> & {
        modify(options: import("../../../types.js").ILayerMaterialOptions): Omit<import("../../../util").CommonMaterial, "modify>">;
    } & {
        cullSide: GLSettings.Material.CullSide;
    };
}
