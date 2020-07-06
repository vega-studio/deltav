/**
 * This file contains all of the utilities for creating common object types
 */
import { Instance } from "../instance-provider/instance";
import { ILayerConstructable, ILayerProps, LayerInitializer } from "../surface/layer";
import { IInstanceAttribute, IUniform, IVertexAttribute, Omit } from "../types";
/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export declare function createAttribute<T extends Instance>(options: IInstanceAttribute<T> & Partial<{
    [key: string]: any;
}>): IInstanceAttribute<T> & Partial<{
    [key: string]: any;
}>;
/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export declare function createUniform(options: IUniform): IUniform;
/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export declare function createVertex(options: IVertexAttribute): IVertexAttribute;
/**
 * Used for reactive layer generation and updates.
 */
export declare function createLayer<T extends Instance, U extends ILayerProps<T>>(layerClass: ILayerConstructable<T> & {
    defaultProps: U;
}, props: Omit<U, "key"> & Partial<Pick<U, "key">>): LayerInitializer;
