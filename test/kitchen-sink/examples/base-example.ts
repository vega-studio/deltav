import {
  BasicCameraController,
  ChartCamera,
  EventManager,
  IInstanceProvider,
  Instance,
  LayerInitializer,
  LayerSurface
} from "src";

export type TestResourceKeys = {
  atlas: string;
  font: string;
};

export abstract class BaseExample {
  surface: LayerSurface;
  view: string;

  destroy() {
    // Clear resources
  }

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
    _resources: TestResourceKeys,
    _provider: IInstanceProvider<Instance>
  ): LayerInitializer | LayerInitializer[] {
    // IMPLEMENTED BY SUB CLASS
    return [];
  }

  abstract makeProvider(): IInstanceProvider<Instance>;
}
