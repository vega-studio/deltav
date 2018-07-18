import {
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LayerInitializer,
} from 'src';
import { BaseExample } from './base-example';

export class Lines extends BaseExample {
  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<EdgeInstance>,
  ): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: 'lines',
      scene: scene,
      type: EdgeType.LINE,
    });
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const LINE_HEIGHT = 100;
    const countHigh = 160;
    const countWide = 500;
    const edges: EdgeInstance[] = [];

    for (let i = 0; i < countHigh; ++i) {
      for (let k = 0; k < countWide; ++k) {
        const edge = new EdgeInstance({
          colorEnd: [Math.random(), Math.random(), 1.0, 1.0],
          colorStart: [Math.random(), Math.random(), 1.0, 1.0],
          end: [k * 20, i * LINE_HEIGHT + 4],
          id: `line-${i}-${k}`,
          start: [k * 20, i * LINE_HEIGHT + LINE_HEIGHT],
          widthEnd: 10,
          widthStart: 10,
        });

        edge.end = [
          Math.sin(Date.now() / 4e2 + k * 20) * 10 + k * 20,
          edge.end[1],
        ];
        edges.push(edgeProvider.add(edge));
      }
    }

    const { sin } = Math;

    setInterval(() => {
      let next = -1;
      const now = Date.now();

      // for (let i = 0; i < countHigh; ++i) {
      //   for (let k = 0; k < countWide; ++k) {
      //     const edge = edges[++next];
      //     edge.end = [
      //       sin(now / 4e2 + k * 20) * 10 + k * 20,
      //       edge.end[1],
      //     ];
      //   }
      // }

      next = 30 * 20;
      for (let i = 30; i < 40; ++i) {
        for (let k = 20; k < 40; ++k) {
          const edge = edges[++next];
          edge.end = [
            sin(now / 4e2 + k * 20) * 10 + k * 20,
            edge.end[1],
          ];
        }
      }
    }, 1000 / 60);

    return edgeProvider;
  }
}
