import {
  AutoEasingMethod,
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
    info.instances.forEach(edge => (edge.thickness = [10, 10]));
  };

  handleMouseMove = (info: IPickInfo<EdgeInstance>) => {
    if (info.instances.length <= 0) {
      this.side = 0;
      return;
    }

    if (info.world[0] < 100 && this.side !== -1) {
      this.side = -1;
      info.instances.forEach(edge => (edge.thickness = [20, 10]));
    }

    if (info.world[0] >= 100 && this.side !== 1) {
      this.side = 1;
      info.instances.forEach(edge => (edge.thickness = [10, 20]));
    }
  };

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      animate: {
        thickness: AutoEasingMethod.easeOutElastic(500)
      },
      data: provider,
      key: "mouse-interaction-lines",
      onMouseMove: this.handleMouseMove,
      onMouseOut: this.handleMouseOut,
      opacity: 1.0,
      picking: PickType.SINGLE,
      type: EdgeType.BEZIER2
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const TOTAL_EDGES = 10;

    for (let i = 0; i < TOTAL_EDGES; ++i) {
      const edge = new EdgeInstance({
        startColor: [Math.random(), 1.0, Math.random(), 1.0],
        endColor: [Math.random(), 1.0, Math.random(), 0.01],
        control: [[60, 20 * i - 40], [160, 20 * i - 40]],
        end: [200, 20 * i + 20],
        start: [20, 20 * i + 20],
        thickness: [10, 10]
      });

      edgeProvider.add(edge);
    }

    return edgeProvider;
  }
}
