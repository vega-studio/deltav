import * as anime from 'animejs';
import { CircleInstance, CircleLayer, createLayer, DataProvider, IPickInfo, LayerInitializer, PickType } from '../../src';
import { BaseExample } from './base-example';

export class MouseInteraction extends BaseExample {
  isOver = new Map<CircleInstance, anime.AnimeInstance>();
  hasLeft = new Map<CircleInstance, anime.AnimeInstance>();

  handleCircleClick = (info: IPickInfo<CircleInstance>) => {
    for (const circle of info.instances) {
      // Anime doesn't seem to do internal array interpolation, so we target the color itself
      // And then apply the color property to the circle in the update ticks to register the deltas
      anime({
        0: 0,
        1: 1,
        2: 0,
        3: 1,
        targets: circle.color,
        update: () => {
          circle.color = circle.color;
        },
      });
    }
  }

  handleCircleOver = (info: IPickInfo<CircleInstance>) => {
    for (const circle of info.instances) {
      if (!this.isOver.get(circle)) {
        const animation = anime({
          radius: 20,
          targets: circle,
        });

        this.isOver.set(circle, animation);
      }
    }
  }

  handleCircleOut = async(info: IPickInfo<CircleInstance>) => {
    for (const circle of info.instances) {
      const animation = this.isOver.get(circle);

      if (animation) {
        this.isOver.delete(circle);

        const leave = anime({
          radius: 5,
          targets: circle,
        });

        leave.pause();
        this.hasLeft.set(circle, leave);

        await animation.finished;

        leave.play();
      }
    }
  }

  makeLayer(scene: string, atlas: string, provider: DataProvider<CircleInstance>): LayerInitializer {
    return createLayer(CircleLayer, {
      data: provider,
      key: 'mouse-interaction',
      onMouseClick: this.handleCircleClick,
      onMouseOut: this.handleCircleOut,
      onMouseOver: this.handleCircleOver,
      picking: PickType.ALL,
      scaleFactor: () => 1,
      scene: scene,
    });
  }

  makeProvider(): DataProvider<CircleInstance> {
    const circleProvider = new DataProvider<CircleInstance>([]);

    for (let i = 0; i < 40; ++i) {
      for (let k = 0; k < 30; ++k) {
        const circle = new CircleInstance({
          color: [1.0, Math.random(), Math.random(), Math.random() * 0.8 + 0.2],
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
