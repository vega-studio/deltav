import {
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerInitializer
} from "src";
import { BaseExample } from "./base-example";

export class BendyEdge extends BaseExample {
  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: "bendy-edge",
      scene: scene,
      type: EdgeType.BEZIER
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();

    const edges: EdgeInstance[] = [];
    const TOTAL_EDGES = 10;

    for (let i = 0; i < TOTAL_EDGES; ++i) {
      const edge = new EdgeInstance({
        colorEnd: [1.0, 0.0, 1.0, 1.0],
        colorStart: [0.0, 1.0, 1.0, 1.0],
        control: [[200, 150]],
        end: [200, 250],
        id: `edge-bendy`,
        start: [200, 15],
        widthEnd: 10,
        widthStart: 10
      });

      edges.push(edge);
      edgeProvider.add(edge);
    }

    setInterval(() => {
      for (let i = 0; i < TOTAL_EDGES; ++i) {
        const edge = edges[i];
        edge.start = [
          Math.sin(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) * 100 +
            200,
          edge.start[1]
        ];
        edge.end = [
          Math.cos(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) * 100 +
            200,
          edge.end[1]
        ];
      }
    }, 1000 / 60);

    return edgeProvider;
  }
}
