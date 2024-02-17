import {
  ILayerConstructable,
  ILayerConstructionClass,
  ILayerProps,
  LayerInitializer,
} from "../surface/layer";
import { Instance } from "../instance-provider/instance";

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
  }) as TLayerProps;

  return {
    get key() {
      return props.key || "";
    },
    init: [layerClass, keyedProps],
  };
}

/**
 * Helps construct child layers that are compatible with the child layering
 * system.
 */
export function createChildLayer<
  TInstance extends Instance,
  TLayerProps extends ILayerProps<TInstance>,
>(
  layerClass: ILayerConstructable<TInstance, TLayerProps> & {
    defaultProps: TLayerProps;
  },
  props: Omit<TLayerProps, "key" | "data"> &
    Partial<Pick<TLayerProps, "key" | "data">>
): LayerInitializer<Instance, ILayerProps<Instance>> {
  // Our props are a guaranteed ILayerProps from this initialization
  const keyedProps: ILayerProps<Instance> = Object.assign(props, {
    key: props.key || layerClass.defaultProps.key,
    data: props.data || layerClass.defaultProps.data,
  }) as TLayerProps;

  // With a guaranteed prop type we can resolve that the only problematic
  // property of our contructor "props: TLayerProps" is indeed an
  // ILayerProps<Instance>. From this understanding we NOW can know that our
  // layerClass has a constructor that satisfies a base LayerInitializer

  return {
    get key() {
      return props.key || "";
    },
    init: [
      layerClass as unknown as ILayerConstructionClass<
        Instance,
        ILayerProps<Instance>
      >,
      keyedProps,
    ],
  };
}
