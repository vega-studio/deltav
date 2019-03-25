import {
  AnchorType,
  AutoEasingMethod,
  createLayer,
  EasingUtil,
  GlyphInstance,
  GlyphLayer,
  IEasingControl,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class FontEngineGlyphControl extends BaseExample {
  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      animate: {
        offset: AutoEasingMethod.easeInOutCubic(2000),
        color: AutoEasingMethod.easeInOutCubic(2000),
        origin: AutoEasingMethod.easeInOutCubic(2000)
      },
      resourceKey: resource.font,
      data: provider,
      key: "font-engine-glyph-control",
      scene
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const provider = new InstanceProvider<LabelInstance>();

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
        },
        color: [1, 1, 1, 0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "Anchored Middle Left:",
        origin: [20, 20],

        onReady: async (label: LabelInstance) => {
          const { color, origin } = GlyphLayer.attributeNames;
          const attributes = [color, origin];

          EasingUtil.all(
            false,
            label.glyphs,
            attributes,
            (
              easing: IEasingControl,
              _o: GlyphInstance,
              i: number,
              _attrIndex: number
            ) => {
              easing.setTiming(i * 200);
            }
          );

          label.origin = [100, 100];
          label.color = [1.0, 1.0, 1.0, 1.0];

          await EasingUtil.all(true, label.glyphs, attributes);

          label.origin = [200, 200];
          label.color = [1, 1, 1, 0];

          await EasingUtil.all(true, label.glyphs, attributes);

          provider.remove(label);
        }
      })
    );

    return provider;
  }
}
