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
    getMaterialOptions(): Partial<Pick<Pick<Partial<import("../../../gl").Material>, "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "fragmentShader" | "name" | "polygonOffset" | "uniforms" | "vertexShader">, "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "name" | "polygonOffset">> & {
        cullSide: GLSettings.Material.CullSide;
    };
}
