import {
  AnchorType,
  AutoEasingMethod,
  BasicCamera2DController,
  Camera2D,
  createLayer,
  EventManager,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer
} from "src";
import { STORY, WORDS } from "../../../types";
import { BaseExample, TestResourceKeys } from "./base-example";

export class FontEngineGlyphControl extends BaseExample {
  makeController(
    defaultCamera: Camera2D,
    _testCamera: Camera2D,
    viewName: string
  ): EventManager {
    return new BasicCamera2DController({
      camera: defaultCamera,
      startView: viewName,
      wheelShouldScroll: true
    });
  }

  makeLayer(
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
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const bounds = this.surface.getViewSize(this.view);
    const provider = new InstanceProvider<LabelInstance>();
    if (!bounds) return provider;

    const lines = STORY.split("\n");
    let i = 0;

    for (; i < lines.length; ++i) {
      if (lines[i]) {
        provider.add(
          new LabelInstance({
            anchor: {
              padding: 0,
              type: AnchorType.MiddleLeft
            },
            color: [1, 1, 1, 1],
            fontSize: 12,
            text: lines[i],
            origin: [20, 14 + i * 14],
            maxWidth: bounds.width - 40
          })
        );
      }
    }

    for (const iMax = i + 200; i < iMax; ++i) {
      const length = Math.ceil(Math.random() * 10);
      const sentence = [];

      for (let k = 0; k < length; ++k) {
        sentence.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }

      provider.add(
        new LabelInstance({
          anchor: {
            padding: 0,
            type: AnchorType.MiddleLeft
          },
          color: [1, 1, 1, 1],
          fontSize: 11,
          text: sentence.join(" "),
          origin: [20, 14 + i * 14],
          maxWidth: bounds.width - 40
        })
      );
    }

    return provider;
  }
}
