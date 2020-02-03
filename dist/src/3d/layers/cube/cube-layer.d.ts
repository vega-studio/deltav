import { GLSettings } from "../../../gl";
import { ILayerProps, Layer } from "../../../surface/layer";
import { IShaderInitialization } from "../../../types";
import { CubeInstance } from "./cube-instance";
export interface ICubeLayerProps<TInstance extends CubeInstance> extends ILayerProps<TInstance> {
}
/**
 * Layer for rendering simple cube primitives
 */
export declare class CubeLayer<TInstance extends CubeInstance, TProps extends ICubeLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ICubeLayerProps<CubeInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    getMaterialOptions(): Partial<Pick<Pick<Partial<import("../../../gl").Material>, "name" | "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "fragmentShader" | "polygonOffset" | "uniforms" | "vertexShader">, "name" | "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "polygonOffset">> & {
        cullSide: GLSettings.Material.CullSide;
    };
}
