import { GLSettings } from "../../../gl";
import { ILayerProps, Layer } from "../../../surface/layer";
import { IShaderInitialization } from "../../../types";
import { TriangleInstance } from "./triangle-instance";
export interface ITriangleLayerProps<TInstance extends TriangleInstance> extends ILayerProps<TInstance> {
}
/**
 * Layer for rendering simple Triangle primitives
 */
export declare class TriangleLayer<TInstance extends TriangleInstance, TProps extends ITriangleLayerProps<TInstance>> extends Layer<TInstance, TProps> {
    static defaultProps: ITriangleLayerProps<TriangleInstance>;
    initShader(): IShaderInitialization<TInstance> | null;
    getMaterialOptions(): Partial<Pick<Pick<Partial<import("../../../gl").Material>, "name" | "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "fragmentShader" | "polygonOffset" | "uniforms" | "vertexShader">, "name" | "blending" | "colorWrite" | "culling" | "depthFunc" | "depthTest" | "depthWrite" | "dithering" | "polygonOffset">> & {
        cullSide: GLSettings.Material.CullSide;
    };
}
