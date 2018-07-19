import { Instance } from "../../instance-provider/instance";
import { IShaderExtension, IShaderInitialization } from "../../types";
export declare function extendShader<T extends Instance>(shaderIO: IShaderInitialization<T>, vs?: IShaderExtension, fs?: IShaderExtension): {
    fs: string;
    vs: string;
};
