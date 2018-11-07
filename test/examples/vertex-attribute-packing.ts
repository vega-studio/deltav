import {
  AutoEasingLoopStyle,
  AutoEasingMethod,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerInitializer
} from "src";
import { BaseExample } from "./base-example";

export class VertexAttributePacking extends BaseExample {
  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      animate: {
        start: AutoEasingMethod.linear(100, 0, AutoEasingLoopStyle.REPEAT),
        end: AutoEasingMethod.linear(100, 0, AutoEasingLoopStyle.REPEAT),
        colorStart: AutoEasingMethod.linear(100, 0, AutoEasingLoopStyle.REPEAT),
        colorEnd: AutoEasingMethod.linear(100, 0, AutoEasingLoopStyle.REPEAT)
      },
      data: provider,
      key: "vertex-attribute-packing",
      scene: scene,
      type: EdgeType.BEZIER,
      printShader: true
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const edges: EdgeInstance[] = [];
    const TOTAL_EDGES = 10;

    setTimeout(() => {
      const bounds = this.surface.getViewSize(this.view);
      if (!bounds) return;

      for (let i = 0; i < TOTAL_EDGES; ++i) {
        const edge = new EdgeInstance({
          colorEnd: [1.0, 0.0, 1.0, 1.0],
          colorStart: [0.0, 1.0, 1.0, 1.0],
          control: [[bounds.width / 2, bounds.height / 2]],
          end: [
            Math.cos(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) * 100 +
              bounds.width / 2,
            bounds.height - 5
          ],
          start: [
            Math.sin(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) * 100 +
              bounds.width / 2,
            5
          ],
          widthEnd: 5,
          widthStart: 5
        });

        edges.push(edge);
        edgeProvider.add(edge);
      }

      setInterval(() => {
        const totalWidth = bounds.width / 4 + bounds.width / 2;
        for (let i = 0; i < TOTAL_EDGES; ++i) {
          const edge = edges[i];
          edge.colorEnd = [
            (Math.sin(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2) /
              totalWidth,
            0.0,
            1.0,
            1.0
          ];
          edge.colorStart = [
            0.0,
            1.0,
            (Math.cos(Date.now() / 4e2 + i * Math.PI * 2 / TOTAL_EDGES) *
              (bounds.width / 4) +
              bounds.width / 2) /
              totalWidth,
            1.0
          ];

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
      }, 1000 / 20);
    }, 1000);

    return edgeProvider;
  }
}
