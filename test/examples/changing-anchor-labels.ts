import {
  Anchor,
  AnchorType,
  createLayer,
  DataProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ScaleType
} from "../../src";
import { BaseExample } from "./base-example";

export class ChangingAnchorLabels extends BaseExample {
  makeLayer(
    scene: string,
    atlas: string,
    provider: DataProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      atlas,
      data: provider,
      key: "changing-anchor-labels",
      scene: scene
    });
  }

  makeProvider(): DataProvider<LabelInstance> {
    const labelProvider = new DataProvider<LabelInstance>([]);

    for (let i = 0; i < 625; ++i) {
      labelProvider.instances.push(
        new LabelInstance({
          anchor: {
            padding: 0,
            type: AnchorType.Middle
          },
          color: [
            Math.random(),
            Math.random(),
            Math.random(),
            Math.random() * 0.8 + 0.2
          ],
          fontFamily: "Arial",
          fontSize: 20,
          fontStyle: "normal",
          fontWeight: "normal",
          id: `label-test-${i}`,
          rasterization: {
            scale: 1.0
          },
          scaling: [ScaleType.NEVER, ScaleType.ALWAYS, ScaleType.BOUND_MAX][
            Math.floor(Math.random() * 3.0)
          ],
          text: "Changing Anchor Point",
          x: Math.random() * 1500,
          y: Math.random() * 1500
        })
      );
    }

    setInterval(() => {
      for (const label of labelProvider.instances) {
        const anchor: Anchor = {
          padding: 0,
          type: [
            AnchorType.TopLeft,
            AnchorType.TopMiddle,
            AnchorType.TopRight,
            AnchorType.MiddleLeft,
            AnchorType.Middle,
            AnchorType.MiddleRight,
            AnchorType.BottomLeft,
            AnchorType.BottomMiddle,
            AnchorType.BottomRight
          ][Math.floor(Math.random() * 9)]
        };
        label.setAnchor(anchor);
      }
    }, 100);

    return labelProvider;
  }
}
