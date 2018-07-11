import {
  BasicCameraController,
  ChartCamera,
  createLayer,
  DataProvider,
  EventManager,
  Instance,
  LayerInitializer,
  LayerSurface,
  RingLayer
} from "../../src";

export abstract class BaseExample {
  surface: LayerSurface;
  view: string;

  keyEvent(_e: KeyboardEvent, _isDown: boolean) {
    // Not required key event handler
  }

  makeController(
    defaultCamera: ChartCamera,
    _testCamera: ChartCamera,
    viewName: string
  ): EventManager {
    return new BasicCameraController({
      camera: defaultCamera,
      startView: viewName
    });
  }

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    return defaultCamera;
  }

  makeLayer(
    scene: string,
    _atlas: string,
    provider: DataProvider<Instance>
  ): LayerInitializer {
    // IMPLEMENTED BY SUB CLASS
    return createLayer(RingLayer, {
      data: provider,
      key: "ring-layer-0",
      scene
    });
  }

  abstract makeProvider(): DataProvider<Instance>;
}
