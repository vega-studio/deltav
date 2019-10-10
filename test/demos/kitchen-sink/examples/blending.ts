import { hsl } from 'd3-color';
import {
  AutoEasingMethod,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  LabelLayer,
  LayerInitializer,
  Vec4,
} from '../../../../src';
import { BaseExample, TestResourceKeys } from './base-example';

export class Blending extends BaseExample {
  makeLayer(
    resource: TestResourceKeys,
    provider: InstanceProvider<EdgeInstance>
  ): LayerInitializer[] {
    return [
      createLayer(EdgeLayer, {
        animate: {
          endColor: AutoEasingMethod.easeInOutCubic(3000),
          startColor: AutoEasingMethod.easeInOutCubic(3000),
        },
        data: provider,
        key: 'blending',
        type: EdgeType.LINE,
      }),
      createLayer(LabelLayer, {
        data: new InstanceProvider(),
        key: 'blending-labels',
        resourceKey: resource.font,
      }),
    ];
  }

  makeProvider(): InstanceProvider<EdgeInstance> {
    const edgeProvider = new InstanceProvider<EdgeInstance>();
    const sections = 100;
    const edges = [];

    for (let i = 0; i < sections; ++i) {
      const rgb = hsl(i / sections * 360, 1, 0.5, 0.2).rgb();
      const color: Vec4 = [rgb.r / 255, rgb.g / 255, rgb.b / 255, rgb.opacity];

      const sx = Math.cos(i / sections * Math.PI) * 100 + 200;
      const sy = Math.sin(i / sections * Math.PI) * 100 + 200;
      const ex = Math.cos(i / sections * Math.PI + Math.PI) * 100 + 200;
      const ey = Math.sin(i / sections * Math.PI + Math.PI) * 100 + 200;

      edges.push(
        new EdgeInstance({
          startColor: color,
          endColor: color,
          depth: -i,
          thickness: [5, 5],
          start: [sx, sy],
          end: [ex, ey],
        })
      );
    }

    edgeProvider.add(
      new EdgeInstance({
        startColor: [1, 0, 0, 0.333333],
        endColor: [1, 0, 0, 0.333333],
        depth: 0,
        thickness: [10, 10],
        start: [10, 0],
        end: [10, 100],
      })
    );

    edgeProvider.add(
      new EdgeInstance({
        startColor: [0, 1, 0, 0.333333],
        endColor: [0, 1, 0, 0.333333],
        depth: 1,
        thickness: [10, 10],
        start: [10, 20],
        end: [10, 120],
      })
    );

    edgeProvider.add(
      new EdgeInstance({
        startColor: [0, 0, 1, 0.333333],
        endColor: [0, 0, 1, 0.333333],
        depth: 1,
        thickness: [10, 10],
        start: [10, 40],
        end: [10, 140],
      })
    );

    while (edges.length > 0) {
      const index = Math.floor(Math.random() * edges.length);
      edgeProvider.add(edges[index]);
      edges.splice(index, 1);
    }

    return edgeProvider;
  }
}
