import {
  AutoEasingMethod,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerInitializer
} from "src";
import { BaseExample } from "./base-example";

export class Lines extends BaseExample {
  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      animate: {
        end: AutoEasingMethod.continuousSinusoidal(5000, 0)
      },
      data: provider,
      key: "lines",
      scene: scene,
      type: EdgeType.LINE
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const LINE_HEIGHT = 100;
    const countHigh = 40;
    const countWide = 240;
    const edges: EdgeInstance[] = [];

    for (let i = 0; i < countHigh; ++i) {
      const index = i;
      setTimeout(() => {
        const newEdges: EdgeInstance[] = [];

        for (let k = 0; k < countWide; ++k) {
          const edge = new EdgeInstance({
            colorEnd: [Math.random(), Math.random(), 1.0, 1.0],
            colorStart: [Math.random(), Math.random(), 1.0, 1.0],
            end: [k * 20, index * LINE_HEIGHT + 4],
            id: `line-${index}-${k}`,
            start: [k * 20, index * LINE_HEIGHT + LINE_HEIGHT],
            widthEnd: 10,
            widthStart: 10
          });

          edges.push(edgeProvider.add(edge));
          newEdges.push(edge);
        }

        setTimeout(() => {
          for (let j = 0; j < newEdges.length; ++j) {
            const edge = newEdges[j];
            edge.end = [j * 20 + 5, edge.end[1]];
          }
        }, 20);
      }, 100 * i);
    }

    return edgeProvider;
  }
}
