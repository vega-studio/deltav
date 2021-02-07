import { Instance } from "../instance-provider/instance";
import { IInstanceAttribute } from "../types";

/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export function createAttribute<T extends Instance>(
  options: IInstanceAttribute<T> & Partial<{ [key: string]: any }>
) {
  return options;
}
