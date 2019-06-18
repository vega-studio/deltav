import {
  BasicCameraController,
  EventManager,
  IInstanceProvider,
  Instance,
  LayerInitializer,
  Surface
} from "src";
import { Camera } from "src/util/camera";

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
    defaultCamera: Camera,
    _testCamera: Camera,
    viewName: string
  ): EventManager {
    return new BasicCameraController({
      camera: defaultCamera,
      startView: viewName
    });
  }

  makeCamera(defaultCamera: Camera): Camera {
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
