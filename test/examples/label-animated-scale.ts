import {
  AnchorType,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class LabelAnimatedScale extends BaseExample {
  minScale: number = 0.1;
  maxScale: number = 2;
  scaleStep: number = 0.05;

  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      resourceKey: resource.font,
      data: provider,
      key: "label-animated-scale",
      scene
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const provider = new InstanceProvider<LabelInstance>();
    const label = provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.TopLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        scale: 1.0,
        text: "Scaling text...:",
        position: [20, 100]
      })
    );

    setInterval(() => {
      const newScale = label.scale + this.scaleStep;
      if (newScale > this.maxScale) {
        this.scaleStep *= -1;
      } else if (newScale < this.minScale) {
        this.scaleStep *= -1;
      }
      label.scale = newScale;
    }, 50);

    return provider;
  }
}
