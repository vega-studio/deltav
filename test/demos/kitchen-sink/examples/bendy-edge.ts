import {
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerInitializer,
  nextFrame
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class BendyEdge extends BaseExample {
  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: "bendy-edge",
      type: EdgeType.BEZIER
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();

    const edges: EdgeInstance[] = [];
    const TOTAL_EDGES = 10;

    nextFrame(() => {
      const bounds = this.surface.getViewSize(this.view);
      if (!bounds) return;

      for (let i = 0; i < TOTAL_EDGES; ++i) {
        const edge = new EdgeInstance({
          startColor: [0.0, 1.0, 1.0, 1.0],
          endColor: [1.0, 0.0, 1.0, 1.0],
          control: [[bounds.width / 2, bounds.height / 2]],
          end: [200, bounds.height - 10],
          id: `edge-bendy`,
          start: [200, 5],
          thickness: [5, 5]
        });

        edges.push(edge);
        edgeProvider.add(edge);
      }

      setInterval(() => {
        for (let i = 0; i < TOTAL_EDGES; ++i) {
          const edge = edges[i];
          edge.start = [
            Math.sin(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2,
            edge.start[1]
          ];
          edge.end = [
            Math.cos(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2,
            edge.end[1]
          ];
        }
      }, 1000 / 60);
    });

    return edgeProvider;
  }
}
