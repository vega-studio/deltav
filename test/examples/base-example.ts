import { BasicCameraController, ChartCamera, createLayer, EventManager, IInstanceProvider, Instance, LayerInitializer, LayerSurface, RingLayer } from '../../src';

export abstract class BaseExample {
  surface: LayerSurface;
  view: string;

  keyEvent(e: KeyboardEvent, isDown: boolean) {
    // Not required key event handler
  }

  makeController(defaultCamera: ChartCamera, testCamera: ChartCamera, viewName: string): EventManager {
    return  new BasicCameraController({
      camera: defaultCamera,
      startView: viewName,
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    return defaultCamera;
  }

  makeLayer(scene: string, atlas: string, provider: IInstanceProvider<Instance>): LayerInitializer | LayerInitializer[] {
    // IMPLEMENTED BY SUB CLASS
    return createLayer(RingLayer, {
      data: provider,
      key: 'ring-layer-0',
      scene,
    });
  }

  abstract makeProvider(): IInstanceProvider<Instance>;
}
