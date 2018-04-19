import * as anime from 'animejs';
import { AnchorType, CircleInstance, createLayer, DataProvider, ImageInstance, ImageLayer, IPickInfo, LayerInitializer, PickType, ScaleType } from '../../src';
import { BaseExample } from './base-example';

const iconData = require('./images/leaf.png');
const icon = new Image();
icon.src = iconData;

export class MouseInteractionImages extends BaseExample {
  isOver = new Map<CircleInstance, anime.AnimeInstance>();
  hasLeft = new Map<CircleInstance, anime.AnimeInstance>();

  handleImageClick = (info: IPickInfo<CircleInstance>) => {
    for (const image of info.instances) {
      // Anime doesn't seem to do internal array interpolation, so we target the color itself
      // And then apply the color property to the circle in the update ticks to register the deltas
      anime({
        0: 0,
        1: 1,
        2: 0,
        3: 1,
        targets: image.color,
        update: () => {
          image.color = image.color;
        },
      });
    }
  }

  handleImageOver = (info: IPickInfo<CircleInstance>) => {
    for (const image of info.instances) {
      if (!this.isOver.get(image)) {
        const animation = anime({
          targets: image,
          x: 50,
        });

        this.isOver.set(image, animation);
      }
    }
  }

  handleImageOut = async(info: IPickInfo<CircleInstance>) => {
    for (const image of info.instances) {
      const animation = this.isOver.get(image);

      if (animation) {
        this.isOver.delete(image);

        const leave = anime({
          targets: image,
          x: 20,
        });

        leave.pause();
        this.hasLeft.set(image, leave);

        await animation.finished;

        leave.play();
      }
    }
  }

  makeLayer(scene: string, atlas: string, provider: DataProvider<ImageInstance>): LayerInitializer {
    return createLayer(ImageLayer, {
      atlas,
      data: provider,
      key: 'mouse-interaction-images',
      onMouseClick: this.handleImageClick,
      onMouseOut: this.handleImageOut,
      onMouseOver: this.handleImageOver,
      picking: PickType.ALL,
      scene: scene,
    });
  }

  makeProvider(): DataProvider<ImageInstance> {
    const provider = new DataProvider<ImageInstance>([]);
    const count = 2;

    const image = new ImageInstance({
      element: icon,
      id: `image_0`,
      scaling: ScaleType.ALWAYS,
      tint: [1.0, 1.0, 1.0, 1.0],
      x: 20,
      y: 20,
    });

    // Left Middle left
    provider.instances.push(image);

    provider.instances.push(new ImageInstance({
      element: icon,
      id: `image_1`,
      scaling: ScaleType.BOUND_MAX,
      tint: [1.0, 1.0, 1.0, 1.0],
      x: 20,
      y: 50,
    }));

    provider.instances.push(new ImageInstance({
      element: icon,
      id: `image_2`,
      scaling: ScaleType.NEVER,
      tint: [1.0, 1.0, 1.0, 1.0],
      x: 20,
      y: 80,
    }));

    provider.instances.forEach(image => {
      const aspect = image.width / image.height;
      image.width = 25 * aspect;
      image.height = 25;
    });

    return provider;
  }
}
