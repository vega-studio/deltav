import { Instance } from "../instance-provider/instance";
import {
  ILayerConstructable,
  ILayerProps,
  LayerInitializer,
} from "../surface/layer";

/**
 * Used for reactive layer generation and updates.
 */
export function createLayer<
  TInstance extends Instance,
  TLayerProps extends ILayerProps<TInstance>,
>(
  layerClass: ILayerConstructable<TInstance, TLayerProps> & {
    defaultProps: TLayerProps;
  },
  props: Omit<TLayerProps, "key" | "data"> &
    Partial<Pick<TLayerProps, "key" | "data">>
): LayerInitializer<TInstance, TLayerProps> {
  const keyedProps = Object.assign(props, {
    key: props.key || layerClass.defaultProps.key,
    data: props.data || layerClass.defaultProps.data,
  });

  return {
    get key() {
      return props.key || "";
    },
    init: [layerClass, keyedProps],
  };
}
