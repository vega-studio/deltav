import {
  add2,
  AnchorType,
  AutoEasingMethod,
  ChartCamera,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ReferenceCamera
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class SingleAxisLabelScaling extends BaseExample {
  isYAxis: boolean = true;

  constructor(yAxis: boolean = true) {
    super();
    this.isYAxis = yAxis;
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    if (this.isYAxis) {
      return new ReferenceCamera({
        base: defaultCamera,
        offsetFilter: (offset: [number, number, number]) => [0, offset[1], 0],
        scaleFilter: (scale: [number, number, number]) => [1, scale[1], 1]
      });
    } else {
      return new ReferenceCamera({
        base: defaultCamera,
        offsetFilter: (offset: [number, number, number]) => [offset[0], 0, 0],
        scaleFilter: (scale: [number, number, number]) => [scale[0], 1, 1]
      });
    }
  }

  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      animate: {
        offset: AutoEasingMethod.easeInOutCubic(2000, 1000),
        color: AutoEasingMethod.easeInOutCubic(2000, 1000)
      },
      resourceKey: resource.font,
      data: provider,
      key: this.isYAxis ? "vertical-label-scaling" : "horizontal-label-scaling",
      scene
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
        text: "Anchored Middle Left:",
        origin: [20, count++ * 20]
      })
    );

    const label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleLeft
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-1`,
      text: "ScaleType: NEVER",
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
        text: "ScaleType: ALWAYS",
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
        text: "ScaleType: BOUND_MAX",
        origin: [20, count++ * 20]
      })
    );

    // MIDDLE RIGHT ANCHORS
    count++;

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleRight
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-4`,
        text: "Anchored Middle Right:",
        origin: [20, count++ * 20],

        onReady: label => {
          label.origin = add2(label.origin, [label.size[0], 0]);
        }
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleRight
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-5`,
        text: "ScaleType: NEVER",
        origin: [20, count++ * 20],

        onReady: label => {
          label.origin = add2(label.origin, [label.size[0], 0]);
        }
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleRight
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-6`,
        text: "ScaleType: ALWAYS",
        origin: [20, count++ * 20],

        onReady: label => {
          label.origin = add2(label.origin, [label.size[0], 0]);
        }
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleRight
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-7`,
        text: "ScaleType: BOUND_MAX",
        origin: [20, count++ * 20],

        onReady: label => {
          label.origin = add2(label.origin, [label.size[0], 0]);
        }
      })
    );

    return provider;
  }
}
