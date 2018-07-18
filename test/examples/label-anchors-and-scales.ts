import {
  AnchorType,
  createLayer,
  InstanceProvider,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  ScaleType,
} from 'src';
import { BaseExample } from './base-example';

export class LabelAnchorsAndScales extends BaseExample {
  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<LabelInstance>,
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      atlas,
      data: provider,
      key: 'label-anchors-and-scales',
      scene,
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const provider = new InstanceProvider<LabelInstance>();

    let count = 1;

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft,
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: 'Arial',
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: 'normal',
        id: `label-vertical-0`,
        rasterization: {
          scale: 1.0,
        },
        scaling: ScaleType.NEVER,
        text: 'Anchored MiddleLeft:',
        x: 20,
        y: count++ * 20,
      }),
    );

    let label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleLeft,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-1`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.NEVER,
      text: 'Scale Type: NEVER',
      x: 20,
      y: count++ * 20,
    });

    // Left Middle left
    provider.add(label);

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft,
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: 'Arial',
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: 'normal',
        id: `label-vertical-2`,
        rasterization: {
          scale: 1.0,
        },
        scaling: ScaleType.ALWAYS,
        text: 'Scale Type: ALWAYS',
        x: 20,
        y: count++ * 20,
      }),
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft,
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontFamily: 'Arial',
        fontSize: 20,
        fontStyle: 'normal',
        fontWeight: 'normal',
        id: `label-vertical-3`,
        rasterization: {
          scale: 1.0,
        },
        scaling: ScaleType.BOUND_MAX,
        text: 'Scale Type: BOUND_MAX',
        x: 20,
        y: count++ * 20,
      }),
    );

    // MIDDLE RIGHT ANCHORS
    count++;

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-4`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.NEVER,
      text: 'Anchored MiddleRight:',
      x: 20,
      y: count++ * 20,
    });

    label.x += label.width;
    provider.add(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-5`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.NEVER,
      text: 'Scale Type: NEVER',
      x: 20,
      y: count++ * 20,
    });

    label.x += label.width;
    provider.add(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-6`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.ALWAYS,
      text: 'Scale Type: ALWAYS',
      x: 20,
      y: count++ * 20,
    });

    label.x += label.width;
    provider.add(label);

    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-7`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.BOUND_MAX,
      text: 'Scale Type: BOUND_MAX',
      x: 20,
      y: count++ * 20,
    });

    label.x += label.width;
    provider.add(label);

    // Test MAX WIDTH
    label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleRight,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-4`,
      maxWidth: 209,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.NEVER,
      text: 'Max Width Should be working on this label!!!',
      x: 20,
      y: count++ * 20,
    });

    label.x += label.width;
    provider.add(label);

    return provider;
  }
}
