import { Instance } from "../instance-provider/instance";
import { InstanceProvider } from "../instance-provider/instance-provider";
import { ILayerProps, Layer } from "./layer";
import { Surface } from "./surface";

export type CommandCallback = (surface: Surface) => void;

export interface ICommandLayerProps<T extends Instance> extends ILayerProps<T> {
  commands: CommandCallback;
}

/**
 * This is a layer that lets you inject commands into the pipeline. Most
 * commands are from the Surface.commands property that you will need, but this
 * opens up the opportunity to make any GL related commands as well.
 *
 * Custom GL is VERY ADVANCED useage. You should stick to using Surface.commands
 * AND read the documentation on those commands.
 */
export class CommandLayer<
  T extends Instance,
  U extends ICommandLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: ICommandLayerProps<Instance> = {
    data: new InstanceProvider<Instance>(),
    key: "",
    commands: () => {
      /** NOOP */
    }
  };

  draw() {
    this.props.commands(this.surface);
  }

  /** The layer renders nothing, thus does not need a shader object */
  initShader() {
    return null;
  }
}
