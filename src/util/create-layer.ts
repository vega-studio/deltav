import { Instance } from "../instance-provider/instance";
import {
  ILayerConstructable,
  ILayerProps,
  LayerInitializer
} from "../surface/layer";

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
