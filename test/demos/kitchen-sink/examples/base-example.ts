import {
  BasicCamera2DController,
  Camera2D,
  EventManager,
  IInstanceProvider,
  Instance,
  LayerInitializer,
  Surface,
} from '../../../../src';

export type TestResourceKeys = {
  atlas: string;
  font: string;
};

export abstract class BaseExample {
  surface: Surface;
  view: string;

  destroy() {
    // Clear resources
  }

  keyEvent(_e: KeyboardEvent, _isDown: boolean) {
    // Not required key event handler
  }

  makeController(
    defaultCamera: Camera2D,
    _testCamera: Camera2D,
    viewName: string
  ): EventManager {
    return new BasicCamera2DController({
      camera: defaultCamera,
      startView: viewName,
    });
  }

  makeCamera(defaultCamera: Camera2D): Camera2D {
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
