import { Instance } from "../instance-provider/instance.js";
import { IInstanceAttribute } from "../types.js";
/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export declare function createAttribute<T extends Instance>(options: IInstanceAttribute<T> & Partial<{
    [key: string]: any;
}>): IInstanceAttribute<T> & Partial<{
    [key: string]: any;
}>;
