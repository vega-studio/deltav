import {
  Anchor,
  AnchorType,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class ChangingAnchorLabels extends BaseExample {
  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      resourceKey: resource.font,
      data: provider,
      key: "changing-anchor-labels",
      scene: scene
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const labelProvider = new InstanceProvider<LabelInstance>();
    const labels: LabelInstance[] = [];

    for (let i = 0; i < 625; ++i) {
      const label = labelProvider.add(
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
          fontSize: 20,
          id: `label-test-${i}`,
          text: "Changing Anchor Point",
          origin: [Math.random() * 1500, Math.random() * 1500]
        })
      );

      labels.push(label);
    }

    setInterval(() => {
      for (const label of labels) {
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
