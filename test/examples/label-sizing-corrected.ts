import {
  AnchorType,
  ChartCamera,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ReferenceCamera,
  ScaleType
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class LabelSizingCorrected extends BaseExample {
  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      resourceKey: resource.font,
      data: provider,
      key: "label-sizing-corrected",
      scene
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    return new ReferenceCamera({
      base: defaultCamera,
      scaleFilter: (scale: [number, number, number]) => [scale[0], scale[1], 1]
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const provider = new InstanceProvider<LabelInstance>();

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.Middle
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: "Arial",
        fontSize: 18,
        fontStyle: "normal",
        fontWeight: "normal",
        id: `label-compare-0`,
        rasterization: {
          scale: 1.0
        },
        scale: 0.5,
        scaling: ScaleType.BOUND_MAX,
        text: "0.5",
        position: [20, 40]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.Middle
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: "Arial",
        fontSize: 18,
        fontStyle: "normal",
        fontWeight: "normal",
        id: `label-compare-1`,
        rasterization: {
          scale: 1.0
        },
        scale: 1.0,
        scaling: ScaleType.BOUND_MAX,
        text: "1.0",
        position: [50, 40]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.Middle
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: "Arial",
        fontSize: 18,
        fontStyle: "normal",
        fontWeight: "normal",
        id: `label-compare-2`,
        rasterization: {
          scale: 1.0
        },
        scale: 2.0,
        scaling: ScaleType.BOUND_MAX,
        text: "2.0",
        position: [80, 40]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.Middle
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: "Arial",
        fontSize: 18,
        fontStyle: "normal",
        fontWeight: "normal",
        id: `label-compare-2`,
        maxScale: 2.0,
        rasterization: {
          scale: 1.0
        },
        scale: 0.5,
        scaling: ScaleType.BOUND_MAX,
        text: "0.5 max 2.0",
        position: [20, 80]
      })
    );

    return provider;
  }
}
