import {
  AnchorType,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ScaleMode
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class LabelAnchorsAndScales extends BaseExample {
  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      resourceKey: resource.font,
      data: provider,
      key: "label-anchors-and-scales",
      scene,
      scaleMode: ScaleMode.ALWAYS
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const provider = new InstanceProvider<LabelInstance>();

    let count = 1;

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "Anchored MiddleLeft:",
        origin: [20, count++ * 20]
      })
    );

    let label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleLeft
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-1`,
      text: "Scale Type: NEVER",
      origin: [20, count++ * 20]
    });

    // Left Middle left
    provider.add(label);

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-2`,
        text: "Scale Type: ALWAYS",
        origin: [20, count++ * 20]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-3`,
        text: "Scale Type: BOUND_MAX",
        origin: [20, count++ * 20]
      })
    );

    // MIDDLE RIGHT ANCHORS
    count++;

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-4`,
      text: "Anchored MiddleRight:",
      origin: [20, count++ * 20]
    });

    provider.add(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-5`,
      text: "Scale Type: NEVER",
      origin: [20, count++ * 20]
    });

    provider.add(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-6`,
      text: "Scale Type: ALWAYS",
      origin: [20, count++ * 20]
    });

    provider.add(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-7`,
      text: "Scale Type: BOUND_MAX",
      origin: [20, count++ * 20]
    });

    provider.add(label);

    // Test MAX WIDTH
    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-4`,
      maxWidth: 209,
      text: "Max Width Should be working on this label!!!",
      origin: [20, count++ * 20]
    });

    provider.add(label);

    return provider;
  }
}
