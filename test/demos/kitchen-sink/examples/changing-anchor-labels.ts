import {
  Anchor,
  AnchorType,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  nextFrame,
} from '../../../../src';
import { BaseExample, TestResourceKeys } from './base-example';

export class ChangingAnchorLabels extends BaseExample {
  makeLayer(
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      resourceKey: resource.font,
      data: provider,
      key: 'changing-anchor-labels',
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const labelProvider = new InstanceProvider<LabelInstance>();

    nextFrame(async () => {
      const bounds = this.surface.getViewSize(this.view);
      if (!bounds) return;

      const labels: LabelInstance[] = [];

      for (let i = 0; i < 1; ++i) {
        const label = labelProvider.add(
          new LabelInstance({
            anchor: {
              padding: 0,
              type: AnchorType.Middle,
            },
            color: [1, 1, 1, 1],
            fontSize: 20,
            id: `label-test-${i}`,
            text: 'Changing Anchor Point',
            origin: [bounds.width / 2, bounds.height / 2],
          })
        );

        labels.push(label);
      }

      let index = 0;
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
              AnchorType.BottomRight,
            ][index++ % 9],
          };
          label.anchor = anchor;
        }
      }, 500);
    });

    return labelProvider;
  }
}
