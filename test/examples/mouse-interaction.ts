import * as anime from 'animejs';
import { CircleInstance, CircleLayer, createLayer, DataProvider, IPickInfo, LayerInitializer, PickType } from '../../src';
import { BaseExample } from './base-example';

export class MouseInteraction extends BaseExample {
  isOver = new Map<CircleInstance, boolean>();

  handleCircleOver = (info: IPickInfo<CircleInstance>) => {
    for (const circle of info.instances) {
      if (!this.isOver.get(circle)) {
        this.isOver.set(circle, true);

        anime({
          radius: 20,
          targets: circle,
        });
      }
    }
  }

  makeLayer(scene: string, atlas: string, provider: DataProvider<CircleInstance>): LayerInitializer {
    return createLayer(CircleLayer, {
      data: provider,
      key: 'mouse-interaction',
      onMouseOver: this.handleCircleOver,
      picking: PickType.ALL,
      scene: scene,
    });
  }

  makeProvider(): DataProvider<CircleInstance> {
    const circleProvider = new DataProvider<CircleInstance>([]);

    for (let i = 0; i < 40; ++i) {
      for (let k = 0; k < 30; ++k) {
        const circle = new CircleInstance({
          color: [1.0, Math.random(), Math.random(), 1.0],
          id: `circle${i * 100 + k}`,
          radius: 5,
          x: i * 10,
          y: k * 10,
        });

        circleProvider.instances.push(circle);
      }
    }

    return circleProvider;
  }
}
