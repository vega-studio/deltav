import { IInstanceAttribute } from "../types";
import { Instance } from "../instance-provider/instance";

/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export function createAttribute<T extends Instance>(
  options: IInstanceAttribute<T> & Partial<{ [key: string]: any }>
) {
  return options;
}
