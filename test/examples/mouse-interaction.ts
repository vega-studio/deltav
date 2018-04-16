import anime from 'animejs';
import { CircleInstance, CircleLayer, createLayer, DataProvider, IPickInfo, LayerInitializer } from '../../src';
import { BaseExample } from './base-example';

export class MouseInteraction extends BaseExample {
  handleCircleOver(info: IPickInfo<CircleInstance>) {
    console.log('OVER');
    anime({
      radius: 20,
      target: info.instances,
    });
  }

  makeLayer(scene: string, atlas: string, provider: DataProvider<CircleInstance>): LayerInitializer {
    return createLayer(CircleLayer, {
      data: provider,
      key: 'box-of-circles',
      onMouseOver: this.handleCircleOver,
      scene: scene,
    });
  }

  makeProvider(): DataProvider<CircleInstance> {
    const circleProvider = new DataProvider<CircleInstance>([]);

    for (let i = 0; i < 25; ++i) {
      for (let k = 0; k < 25; ++k) {
        const circle = new CircleInstance({
          color: [1.0, 0.0, 0.0, 1.0],
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
