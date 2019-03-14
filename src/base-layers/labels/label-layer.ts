import { GlyphInstance } from "src/base-layers/labels/glyph-instance";
import { GlyphLayer } from "src/base-layers/labels/glyph-layer";
import { createLayer, LayerInitializer } from "src/surface";
import { InstanceProvider } from "../../instance-provider/instance-provider";
import { ILayerProps, Layer } from "../../surface/layer";
import { IAutoEasingMethod } from "../../util/auto-easing-method";
import { Vec } from "../../util/vector";
import { LabelInstance } from "./label-instance";

export interface ILabelLayerProps<T extends LabelInstance>
  extends ILayerProps<T> {
  resourceKey?: string;
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
  /** Provider for glyphs */
  glyphProvider = new InstanceProvider<GlyphInstance>();

  /**
   * We override the draw method of the layer to handle the diffs of the provider in a
   * custom fashion by delegating the changes of the provider to the child layers.
   */
  draw() {}

  /**
   * This provides the child layers that will render on behalf of this layer.
   *
   * For Labels, a label is simply a group of well placed glyphs. So we defer all of
   * the labels changes by converting the label into glyphs and applying the changes to
   * it's set of glyphs.
   */
  childLayers(): LayerInitializer[] {
    return [
      createLayer(GlyphLayer, {
        data: this.glyphProvider,
        key: `${this.id}_glyphs`,
        resourceKey: this.props.resourceKey,
        scene: this.props.scene
      })
    ];
  }
}
