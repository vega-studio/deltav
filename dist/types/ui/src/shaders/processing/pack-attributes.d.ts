/**
 * The purpose of this file and processes is to take a layers attributes and
 * instance attributes and optimally pack them into blocks. As it should be
 * known an attribute and a uniform is limited by the hardware in 'blocks'. Each
 * block for webgl 1.0 is 4 floats. If you use a single float and not the rest,
 * you have used an entire block.
 *
 * Thus, we pack down the attributes into appropriate block indices and slots.
 */
import { IInstanceAttribute } from "../../types";
import { Instance } from "../../instance-provider/instance";
/**
 * This is the packing method that calculates the block and block index best
 * suited for an attribute so a layer developer does not have to worry about it.
 */
export declare function packAttributes<T extends Instance>(attributes: IInstanceAttribute<T>[]): void;
