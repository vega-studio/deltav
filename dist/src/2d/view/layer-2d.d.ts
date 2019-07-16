import { Instance } from "../../instance-provider";
import { ILayerProps, Layer } from "../../surface";
import { IShaderInitialization } from "../../types";
export interface ILayer2DProps<TInstance extends Instance> extends ILayerProps<TInstance> {
}
export declare class Layer2D<TInstance extends Instance, UProps extends ILayer2DProps<TInstance>> extends Layer<TInstance, UProps> {
    baseShaderModules(shaderIO: IShaderInitialization<TInstance>): {
        fs: string[];
        vs: string[];
    };
}
