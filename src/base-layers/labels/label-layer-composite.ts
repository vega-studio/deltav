import { createLayer, LayerInitializer } from "src/surface";
import { InstanceProvider } from "../../instance-provider/instance-provider";
import { ILayerProps, Layer } from "../../surface/layer";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { Vec } from "../../util/vector";
import { LabelInstance } from "./label-instance";

export interface ILabelLayerProps<T extends LabelInstance>
  extends ILayerProps<T> {
  atlas?: string;
  animate?: {
    color?: IAutoEasingMethod<Vec>;
    location?: IAutoEasingMethod<Vec>;
    size?: IAutoEasingMethod<Vec>;
  };
}

/**
 * This is a composite layer that will take in and manage Label Instances. The true instance
 * that will be rendered as a result of a Label Instance will simply be Glyph Instances. Hence
 * this is a composite layer that is merely a manager to split up the label's requested string
 * into Glyphs to render.
 */
export class LabelLayer<
  T extends LabelInstance,
  U extends ILabelLayerProps<T>
> extends Layer<T, U> {
  static defaultProps: ILabelLayerProps<LabelInstance> = {
    key: "",
    data: new InstanceProvider<LabelInstance>(),
    scene: "default"
  };

  childLayers(): LayerInitializer[] {
    return [
      createLayer(),
    ];
  }
}
