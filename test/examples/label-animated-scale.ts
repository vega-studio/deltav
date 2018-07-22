import {
  AnchorType,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ScaleType
} from "src";
import { BaseExample } from "./base-example";

export class LabelAnimatedScale extends BaseExample {
  minScale: number = 0.1;
  maxScale: number = 2;
  scaleStep: number = 0.05;

  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      atlas,
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
        fontFamily: "Arial",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "normal",
        id: `label-vertical-0`,
        rasterization: {
          scale: 1.0
        },
        scale: 1.0,
        scaling: ScaleType.BOUND_MAX,
        text: "Scaling text...:",
        x: 20,
        y: 100
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
