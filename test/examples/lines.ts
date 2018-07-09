import {
  createLayer,
  DataProvider,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  LayerInitializer
} from "../../src";
import { BaseExample } from "./base-example";

export class Lines extends BaseExample {
  makeLayer(
    scene: string,
    atlas: string,
    provider: DataProvider<EdgeInstance>
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: "lines",
      scene: scene,
      type: EdgeType.LINE
    });
  }

  makeProvider(): DataProvider<EdgeInstance> {
    const edgeProvider = new DataProvider<EdgeInstance>([]);
    const LINE_HEIGHT = 100;

    for (let i = 0; i < 10; ++i) {
      for (let k = 0; k < 100; ++k) {
        const edge = new EdgeInstance({
          colorEnd: [Math.random(), Math.random(), 1.0, 1.0],
          colorStart: [Math.random(), Math.random(), 1.0, 1.0],
          end: [k * 20, i * LINE_HEIGHT + 4],
          id: `line-${i}-${k}`,
          start: [k * 20, i * LINE_HEIGHT + LINE_HEIGHT],
          widthEnd: 10,
          widthStart: 10
        });

        edge.end = [
          Math.sin(Date.now() / 4e2 + k * 20) * 10 + k * 20,
          edge.end[1]
        ];
        edgeProvider.instances.push(edge);
      }
    }

    setInterval(() => {
      let next = -1;
      for (let i = 0; i < 10; ++i) {
        for (let k = 0; k < 100; ++k) {
          const edge = edgeProvider.instances[++next];
          edge.end = [
            Math.sin(Date.now() / 4e2 + k * 20) * 10 + k * 20,
            edge.end[1]
          ];
        }
      }
    }, 1000 / 60);

    return edgeProvider;
  }
}
