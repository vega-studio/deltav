import { Instance } from "../instance-provider/instance";
import { IShaderInitialization, IShaderIOExtension } from "../types";
export declare function extendShaderInitialization<T extends Instance>(shaderIO: IShaderInitialization<T>, extend: IShaderIOExtension<T>): IShaderInitialization<T>;
