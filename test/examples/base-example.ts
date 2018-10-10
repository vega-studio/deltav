import {
  BasicCameraController,
  ChartCamera,
  EventManager,
  IInstanceProvider,
  Instance,
  LayerInitializer,
  LayerSurface
} from "src";

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
    _scene: string,
    _atlas: string,
    _provider: IInstanceProvider<Instance>
  ): LayerInitializer | LayerInitializer[] {
    // IMPLEMENTED BY SUB CLASS
    return [];
  }

  abstract makeProvider(): IInstanceProvider<Instance>;
}
