import {
  BasicCamera2DController,
  Camera2D,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  EventManager,
  InstanceProvider,
  LayerInitializer,
  PickType
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class MouseScroll extends BaseExample {
  makeController(
    defaultCamera: Camera2D,
    _testCamera: Camera2D,
    viewName: string
  ): EventManager {
    return new BasicCamera2DController({
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
