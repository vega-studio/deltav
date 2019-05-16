import { Instance, InstanceProvider } from "../instance-provider";
import {
  createLayer,
  ILayerConstructable,
  ILayerProps,
  Layer,
  LayerInitializer
} from "../surface";

/**
 * Options for generating a Logging layer
 */
interface ILogChangesLayerProps<T extends Instance> extends ILayerProps<T> {
  /** Provides a header to the log output to make the logs easier to understand */
  messageHeader?: string;
  /** This is the wrapped layer initializer */
  wrap?: LayerInitializer;
}

/**
 * This is a layer intended to help debug changes streaming through instances. This layer wraps
 * another layer and analyzes the changes passed to the child layer without editing the layer in any
 * way.
 */
class LogChangesLayer<
  T extends Instance,
  U extends ILogChangesLayerProps<T>
> extends Layer<T, U> {
  /** Default props for the Layer */
  static defaultProps: ILogChangesLayerProps<any> = {
    data: new InstanceProvider(),
    key: "default",
    messageHeader: "",
    scene: "default",
    wrap: createLayer(Layer, {
      data: new InstanceProvider(),
      scene: "default"
    })
  };

  constructor(props: U) {
    super(props);

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
    return [this.props.wrap];
  }

  /**
   * Our draw loop. We use this to hijack the changes flowing to our wrapped layer so we can output
   * significant information about the changes.
   */
  draw() {
    if (!this.props.wrap) return;
    const changes = this.resolveChanges(true);
    if (changes.length === 0) return;

    console.warn(`${this.props.messageHeader}\n`, {
      totalChanges: changes.length,
      changes
    });
  }

  /**
   * Log the shader information of the layer
   */
  initShader() {
    if (!this.props.wrap) return null;

    const layer = new this.props.wrap[0](this.props.wrap[1]);
    const toProcess = layer.childLayers();
    const childLayers: { [key: string]: {} } = {};

    while (toProcess.length > 0) {
      const child = toProcess.pop();
      if (!child) continue;
      const childLayer = new child[0](child[1]);

      childLayers[childLayer.id] = {
        shaderIO: childLayer.initShader()
      };

      childLayer.childLayers().forEach(l => toProcess.push(l));
    }

    console.warn(`Shader IO: ${this.id}\n`, {
      shaderIO: layer.initShader(),
      childLayers
    });

    return null;
  }
}

/**
 * Can use this instead of createLayer to view changes streaming through a layer.
 */
export function debugLayer<T extends Instance, U extends ILayerProps<T>>(
  layerClass: ILayerConstructable<T> & { defaultProps: U },
  props: U
): LayerInitializer {
  return createLayer(LogChangesLayer, {
    messageHeader: `CHANGES FOR: ${props.key}`,
    wrap: createLayer(layerClass, props),
    scene: props.scene,
    data: props.data,
    key: `debug-wrapper.${props.key}`
  });
}
