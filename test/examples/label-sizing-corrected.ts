import { ChartCamera, createLayer, DataProvider, LabelInstance, LabelLayer, LayerInitializer, ReferenceCamera, ScaleType } from '../../src';
import { BaseExample } from './base-example';

export class LabelSizingCorrected extends BaseExample {
  makeLayer(scene: string, atlas: string, provider: DataProvider<LabelInstance>): LayerInitializer {
    return createLayer(LabelLayer, {
      atlas,
      data: provider,
      key: 'label-sizing-corrected',
      scene,
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    return new ReferenceCamera({
      base: defaultCamera,
      offsetFilter: (offset: [number, number, number]) => [0, 0, 0],
      scaleFilter: (scale: [number, number, number]) => [scale[0], scale[1], 1],
    });
  }

  makeProvider(): DataProvider<LabelInstance> {
    const provider = new DataProvider<LabelInstance>([]);

    provider.instances.push(new LabelInstance({
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 18,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-compare-0`,
      rasterization: {
        scale: 1.0,
      },
      scale: 0.5,
      scaling: ScaleType.BOUND_MAX,
      text: '0',
      x: 20,
      y: 40,
    }));

    provider.instances.push(new LabelInstance({
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 18,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-compare-1`,
      rasterization: {
        scale: 1.0,
      },
      scale: 1.0,
      scaling: ScaleType.BOUND_MAX,
      text: '1',
      x: 20,
      y: 40,
    }));

    provider.instances.push(new LabelInstance({
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 18,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-compare-2`,
      rasterization: {
        scale: 1.0,
      },
      scale: 2.0,
      scaling: ScaleType.BOUND_MAX,
      text: '2',
      x: 20,
      y: 40,
    }));

    return provider;
  }
}
