import { BasicCameraController, ChartCamera, createLayer, DataProvider, EventManager, Instance, LayerInitializer, RingLayer } from '../../src';

export class BaseExample {
  makeController(defaultCamera: ChartCamera, testCamera: ChartCamera, viewName: string): EventManager {
    return  new BasicCameraController({
      camera: defaultCamera,
      startView: viewName,
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    return defaultCamera;
  }

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
