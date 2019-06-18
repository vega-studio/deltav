import {
  add2,
  AnchorType,
  AutoEasingMethod,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ScaleMode,
  uid
} from "src";
import { Camera } from "src/util/camera";
import { BaseExample, TestResourceKeys } from "./base-example";

export class SingleAxisLabelScaling extends BaseExample {
  providers = {
    always: new InstanceProvider<LabelInstance>(),
    never: new InstanceProvider<LabelInstance>(),
    bound: new InstanceProvider<LabelInstance>()
  };
  isYAxis: boolean | undefined = true;
  layers: LayerInitializer[];

  constructor(yAxis?: boolean) {
    super();
    this.isYAxis = yAxis;
  }

  makeCamera(defaultCamera: Camera): Camera {
    /*if (this.isYAxis === undefined) {
      return new ReferenceCamera({
        base: defaultCamera,
        offsetFilter: (offset: [number, number, number]) => [
          offset[0],
          offset[1],
          0
        ],
        scaleFilter: (scale: [number, number, number]) => [
          scale[0],
          scale[1],
          1
        ]
      });
    } else if (this.isYAxis) {
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
    }*/
    return defaultCamera;
  }

  makeLayer(
    resource: TestResourceKeys,
    _provider: InstanceProvider<LabelInstance>
  ): LayerInitializer[] {
    if (!this.layers) {
      this.layers = [
        createLayer(LabelLayer, {
          animate: {
            offset: AutoEasingMethod.easeInOutCubic(2000, 1000),
            color: AutoEasingMethod.easeInOutCubic(2000, 1000)
          },
          resourceKey: resource.font,
          data: this.providers.always,
          key: this.isYAxis
            ? `vertical-label-scaling-${uid()}`
            : `horizontal-label-scaling-${uid()}`,
          scaleMode: ScaleMode.ALWAYS
        }),
        createLayer(LabelLayer, {
          animate: {
            offset: AutoEasingMethod.easeInOutCubic(2000, 1000),
            color: AutoEasingMethod.easeInOutCubic(2000, 1000)
          },
          resourceKey: resource.font,
          data: this.providers.never,
          key: this.isYAxis
            ? `vertical-label-scaling-${uid()}`
            : `horizontal-label-scaling-${uid()}`,
          scaleMode: ScaleMode.NEVER
        }),
        createLayer(LabelLayer, {
          animate: {
            offset: AutoEasingMethod.easeInOutCubic(2000, 1000),
            color: AutoEasingMethod.easeInOutCubic(2000, 1000)
          },
          resourceKey: resource.font,
          data: this.providers.bound,
          key: this.isYAxis
            ? `vertical-label-scaling-${uid()}`
            : `horizontal-label-scaling-${uid()}`,
          scaleMode: ScaleMode.BOUND_MAX
        })
      ];
    }

    return this.layers;
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    let count = 1;

    this.providers.never.add(
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
    this.providers.never.add(label);

    this.providers.always.add(
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

    this.providers.bound.add(
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

    this.providers.never.add(
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

    this.providers.never.add(
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

    this.providers.always.add(
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

    this.providers.bound.add(
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

    return this.providers.always;
  }
}
