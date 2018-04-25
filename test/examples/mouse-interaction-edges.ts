import * as anime from 'animejs';
import { createLayer, DataProvider, EdgeInstance, EdgeLayer, EdgeType, IPickInfo, LayerInitializer, PickType } from '../../src';
import { BaseExample } from './base-example';

export class MouseInteractionEdges extends BaseExample {
  side = 0;

  handleMouseOut = (info: IPickInfo<EdgeInstance>) => {
    this.side = 0;

    anime.remove(info.instances);
    anime({
      targets: info.instances,
      widthEnd: 10,
      widthStart: 10,
    });
  }

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
        widthStart: 20,
      });
    }

    if (info.world[0] >= 100 && this.side !== 1) {
      this.side = 1;
      anime.remove(info.instances);
      anime({
        targets: info.instances,
        widthEnd: 20,
        widthStart: 10,
      });
    }
  }

  makeLayer(scene: string, atlas: string, provider: DataProvider<EdgeInstance>): LayerInitializer {
    return createLayer(EdgeLayer, {
      data: provider,
      key: 'mouse-interaction-lines',
      onMouseMove: this.handleMouseMove,
      onMouseOut: this.handleMouseOut,
      picking: PickType.ALL,
      scene: scene,
      type: EdgeType.BEZIER2,
    });
  }

  makeProvider(): DataProvider<EdgeInstance> {
    const edgeProvider = new DataProvider<EdgeInstance>([]);
    const TOTAL_EDGES = 10;

    for (let i = 0; i < TOTAL_EDGES; ++i) {
      const edge = new EdgeInstance({
        colorEnd: [Math.random(), 1.0, Math.random(), 1.0],
        colorStart: [Math.random(), 1.0, Math.random(), 1.0],
        control: [
          [60, 20 * i - 40],
          [160, 20 * i - 40],
        ],
        end: [200, 20 * i + 20],
        id: `edge-interaction-${i}`,
        start: [20, 20 * i + 20],
        widthEnd: 10,
        widthStart: 10,
      });

      edgeProvider.instances.push(edge);
    }

    return edgeProvider;
  }
}