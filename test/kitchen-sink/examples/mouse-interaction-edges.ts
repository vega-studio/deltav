import * as anime from "animejs";
import {
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class MouseInteractionEdges extends BaseExample {
  side = 0;

  handleMouseOut = (info: IPickInfo<EdgeInstance>) => {
    this.side = 0;

    anime.remove(info.instances);
    anime({
      targets: info.instances,
      widthEnd: 10,
      widthStart: 10
    });
  };

  handleMouseMove = (info: IPickInfo<EdgeInstance>) => {
    if (info.instances.length <= 0) {
      this.side = 0;
      return;
    }

    if (info.world[0] < 100 && this.side !== -1) {
      this.side = -1;
      anime.remove(info.instances);
      anime({
        targets: info.instances,
        widthEnd: 10,
        widthStart: 20
      });
    }

    if (info.world[0] >= 100 && this.side !== 1) {
      this.side = 1;
      anime.remove(info.instances);
      anime({
        targets: info.instances,
        widthEnd: 20,
        widthStart: 10
      });
    }
  };

  makeLayer(
    scene: string,
    _resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: "mouse-interaction-lines",
      onMouseMove: this.handleMouseMove,
      onMouseOut: this.handleMouseOut,
      opacity: 1.0,
      picking: PickType.SINGLE,
      scene: scene,
      type: EdgeType.BEZIER2
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const TOTAL_EDGES = 10;

    for (let i = 0; i < TOTAL_EDGES; ++i) {
      const edge = new EdgeInstance({
        colorEnd: [Math.random(), 1.0, Math.random(), 0.01],
        colorStart: [Math.random(), 1.0, Math.random(), 1.0],
        control: [[60, 20 * i - 40], [160, 20 * i - 40]],
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
