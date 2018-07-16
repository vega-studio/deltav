import {
  AnchorType,
  ChartCamera,
  createLayer,
  DataProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ReferenceCamera,
  ScaleType
} from "../../src";
import { BaseExample } from "./base-example";

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
    atlas: string,
    provider: DataProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      atlas,
      data: provider,
      key: this.isYAxis ? "vertical-label-scaling" : "horizontal-label-scaling",
      scene
    });
  }

  makeProvider(): DataProvider<LabelInstance> {
    const provider = new DataProvider<LabelInstance>([]);

    let count = 1;

    provider.instances.push(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
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
        scaling: ScaleType.BOUND_MAX,
        text: "Anchored MiddleLeft:",
        x: 20,
        y: count++ * 20
      })
    );

    let label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleLeft
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: "Arial",
      fontSize: 20,
      fontStyle: "normal",
      fontWeight: "normal",
      id: `label-vertical-1`,
      rasterization: {
        scale: 1.0
      },
      scaling: ScaleType.NEVER,
      text: "Scale Type: NEVER",
      x: 20,
      y: count++ * 20
    });

    // Left Middle left
    provider.instances.push(label);

    provider.instances.push(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: "Arial",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "normal",
        id: `label-vertical-2`,
        rasterization: {
          scale: 1.0
        },
        scaling: ScaleType.ALWAYS,
        text: "Scale Type: ALWAYS",
        x: 20,
        y: count++ * 20
      })
    );

    provider.instances.push(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: "Arial",
        fontSize: 20,
        fontStyle: "normal",
        fontWeight: "normal",
        id: `label-vertical-3`,
        rasterization: {
          scale: 1.0
        },
        scaling: ScaleType.BOUND_MAX,
        text: "Scale Type: BOUND_MAX",
        x: 20,
        y: count++ * 20
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
      fontFamily: "Arial",
      fontSize: 20,
      fontStyle: "normal",
      fontWeight: "normal",
      id: `label-vertical-4`,
      rasterization: {
        scale: 1.0
      },
      scaling: ScaleType.NEVER,
      text: "Anchored MiddleRight:",
      x: 20,
      y: count++ * 20
    });

    label.x += label.width;
    provider.instances.push(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: "Arial",
      fontSize: 20,
      fontStyle: "normal",
      fontWeight: "normal",
      id: `label-vertical-5`,
      rasterization: {
        scale: 1.0
      },
      scaling: ScaleType.NEVER,
      text: "Scale Type: NEVER",
      x: 20,
      y: count++ * 20
    });

    label.x += label.width;
    provider.instances.push(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: "Arial",
      fontSize: 20,
      fontStyle: "normal",
      fontWeight: "normal",
      id: `label-vertical-6`,
      rasterization: {
        scale: 1.0
      },
      scaling: ScaleType.ALWAYS,
      text: "Scale Type: ALWAYS",
      x: 20,
      y: count++ * 20
    });

    label.x += label.width;
    provider.instances.push(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: "Arial",
      fontSize: 20,
      fontStyle: "normal",
      fontWeight: "normal",
      id: `label-vertical-7`,
      rasterization: {
        scale: 1.0
      },
      scaling: ScaleType.BOUND_MAX,
      text: "Scale Type: BOUND_MAX",
      x: 20,
      y: count++ * 20
    });

    label.x += label.width;
    provider.instances.push(label);

    return provider;
  }
}
