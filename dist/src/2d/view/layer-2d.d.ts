import { Instance } from "../../instance-provider";
import { ILayerProps, Layer } from "../../surface";
import { IShaderInitialization } from "../../types";
export interface ILayer2DProps<TInstance extends Instance> extends ILayerProps<TInstance> {
}
/**
 * Base layer for the 2D world layering system. This essentially just requires the Camera2D to be an available
 * property of the Layer2D as well as provide the 2D projection methods to the layers.
 */
export declare class Layer2D<TInstance extends Instance, UProps extends ILayer2DProps<TInstance>> extends Layer<TInstance, UProps> {
    /**
     * Force the world2D methods as the base methods
     */
    baseShaderModules(shaderIO: IShaderInitialization<TInstance>): {
        fs: string[];
        vs: string[];
    };
}
