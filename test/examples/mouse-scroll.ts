import {
  BasicCameraController,
  ChartCamera,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  EventManager,
  InstanceProvider,
  LayerInitializer,
  PickType
} from "src";
import { BaseExample } from "./base-example";

export class MouseScroll extends BaseExample {
  makeController(
    defaultCamera: ChartCamera,
    _testCamera: ChartCamera,
    viewName: string
  ): EventManager {
    return new BasicCameraController({
      camera: defaultCamera,
      startView: viewName,
      wheelShouldScroll: true
    });
  }

  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: "mouse-scroll-lines",
      opacity: 1.0,
      picking: PickType.SINGLE,
      scene: scene,
      type: EdgeType.LINE
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    for (let i = 0; i < 10; i++) {
      const edge = new EdgeInstance({
        colorEnd: [Math.random(), Math.random(), Math.random(), 1.0],
        colorStart: [Math.random(), Math.random(), Math.random(), 1.0],
        end: [200, 20 * i + 20],
        id: `edge-interaction-${i}`,
        start: [20, 20 * i + 20],
        widthEnd: 10,
        widthStart: 10
      });

      edgeProvider.add(edge);
    }
    return edgeProvider;
  }
}
