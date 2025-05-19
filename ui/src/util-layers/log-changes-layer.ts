import { Instance, InstanceProvider } from "../instance-provider/index.js";
import {
  ILayerConstructable,
  ILayerProps,
  Layer,
  LayerInitializer,
  LayerScene,
  Surface,
} from "../surface";
import { Omit } from "../types.js";
import { createChildLayer, createLayer } from "../util/create-layer.js";

/**
 * Options for generating a Logging layer
 */
interface ILogChangesLayerProps<TInstance extends Instance>
  extends Omit<ILayerProps<TInstance>, "key"> {
  /** Gets the key for the layer. */
  key: string;
  /** Provides a header to the log output to make the logs easier to understand */
  messageHeader?(): string;
  /** This is the wrapped layer initializer */
  wrap?: LayerInitializer<Instance, ILayerProps<Instance>>;
}

/**
 * This is a layer intended to help debug changes streaming through instances. This layer wraps
 * another layer and analyzes the changes passed to the child layer without editing the layer in any
 * way.
 */
class LogChangesLayer<
  TInstance extends Instance,
  TProps extends ILogChangesLayerProps<TInstance>,
> extends Layer<TInstance, TProps> {
  /** Default props for the Layer */
  static defaultProps: ILogChangesLayerProps<any> = {
    data: new InstanceProvider(),
    key: "default",
    messageHeader: () => "",
    wrap: createLayer(Layer, {
      data: new InstanceProvider(),
    }),
  };

  constructor(surface: Surface, scene: LayerScene, props: TProps) {
    super(surface, scene, props);

    console.warn(
      "Please ensure all debugLayer calls are removed for production:",
      props.key
    );
  }

  /**
   * Hand the wrapped layer as a child layer to this layer
   */
  childLayers() {
    if (!this.props.wrap) return [];
    this.props.wrap.init[1].key = `debug-wrapper.${this.props.key}`;
    return [this.props.wrap];
  }

  /**
   * Our draw loop. We use this to hijack the changes flowing to our wrapped
   * layer so we can output significant information about the changes.
   */
  draw() {
    if (!this.props.wrap) return;
    const changes = this.resolveChanges(true);
    if (changes.length === 0) return;
    const { messageHeader = () => "" } = this.props;

    console.warn(`${messageHeader()}\n`, {
      totalChanges: changes.length,
      changes,
    });
  }

  /**
   * Log the shader information of the layer
   */
  initShader() {
    if (!this.props.wrap) return null;

    const layer = new this.props.wrap.init[0](
      this.surface,
      this.scene,
      this.props.wrap.init[1]
    );
    const toProcess = layer.childLayers();
    const childLayers: { [key: string]: object } = {};

    while (toProcess.length > 0) {
      const child = toProcess.pop();
      if (!child) continue;
      const childLayer = new child.init[0](
        this.surface,
        this.scene,
        child.init[1]
      );

      childLayers[childLayer.id] = {
        shaderIO: childLayer.initShader(),
      };

      childLayer.childLayers().forEach((l) => toProcess.push(l));
    }

    console.warn(`Shader IO: ${this.id}\n`, {
      shaderIO: layer.initShader(),
      childLayers,
    });

    return null;
  }
}

/**
 * Can use this instead of createLayer to view changes streaming through a layer.
 */
export function debugLayer<
  TInstance extends Instance,
  TProps extends ILayerProps<TInstance>,
>(
  layerClass: ILayerConstructable<TInstance, TProps> & { defaultProps: TProps },
  props: Omit<TProps, "key" | "data"> & Partial<Pick<TProps, "key" | "data">>
) {
  const initializer = createChildLayer(LogChangesLayer, {
    messageHeader: (): string => `CHANGES FOR: ${initializer.init[1].key}`,
    wrap: createChildLayer(layerClass, props),
    data: props.data,
  });

  return initializer;
}
