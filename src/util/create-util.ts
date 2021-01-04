/**
 * This file contains all of the utilities for creating common object types
 */
import { Instance } from "../instance-provider/instance";
import {
  ILayerConstructable,
  ILayerProps,
  LayerInitializer
} from "../surface/layer";
import { IInstanceAttribute, IUniform, IVertexAttribute, Omit } from "../types";

/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export function createAttribute<T extends Instance>(
  options: IInstanceAttribute<T> & Partial<{ [key: string]: any }>
) {
  return options;
}

/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export function createUniform(options: IUniform) {
  return options;
}

/**
 * Makes it easier to type out and get better editor help in establishing initShader
 */
export function createVertex(options: IVertexAttribute) {
  return options;
}

/**
 * Used for reactive layer generation and updates.
 */
export function createLayer<T extends Instance, U extends ILayerProps<T>>(
  layerClass: ILayerConstructable<T> & { defaultProps: U },
  props: Omit<U, "key" | "data"> & Partial<Pick<U, "key" | "data">>
): LayerInitializer {
  const keyedProps = Object.assign(props, {
    key: props.key || layerClass.defaultProps.key,
    data: props.data || layerClass.defaultProps.data
  });

  return {
    get key() {
      return props.key || "";
    },
    init: [layerClass, keyedProps]
  };
}
