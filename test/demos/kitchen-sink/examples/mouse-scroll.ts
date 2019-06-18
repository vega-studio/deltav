import {
  BasicCameraController,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  EventManager,
  InstanceProvider,
  LayerInitializer,
  PickType
} from "src";
import { Camera } from "src/util/camera";
import { BaseExample, TestResourceKeys } from "./base-example";

export class MouseScroll extends BaseExample {
  makeController(
    defaultCamera: Camera,
    _testCamera: Camera,
    viewName: string
  ): EventManager {
    return new BasicCameraController({
      camera: defaultCamera,
      startView: viewName,
      wheelShouldScroll: true
    });
  }

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: "mouse-scroll-lines",
      opacity: 1.0,
      picking: PickType.SINGLE,
      type: EdgeType.LINE
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    for (let i = 0; i < 10; i++) {
      const edge = new EdgeInstance({
        startColor: [Math.random(), Math.random(), Math.random(), 1.0],
        endColor: [Math.random(), Math.random(), Math.random(), 1.0],
        end: [200, 20 * i + 20],
        id: `edge-interaction-${i}`,
        start: [20, 20 * i + 20],
        thickness: [10, 10]
      });

      edgeProvider.add(edge);
    }
    return edgeProvider;
  }
}
