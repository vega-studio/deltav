import { createLayer, DataProvider, Instance, LayerInitializer, RingLayer } from '../../src';

export class BaseExample {
  makeLayer(scene: string, atlas: string, provider: DataProvider<Instance>): LayerInitializer {
    // IMPLEMENTED BY SUB CLASS
    return createLayer(RingLayer, {
      data: provider,
      key: 'ring-layer-0',
      scene,
    });
  }

  makeProvider(): DataProvider<Instance> {
    // IMPLEMENTED BY SUB CLASS
    return null;
  }
}
