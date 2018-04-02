import { createLayer, DataProvider, ImageInstance, ImageLayer, LayerInitializer, ScaleType } from '../../src';
import { BaseExample } from './base-example';

const iconData = require('./images/leaf.png');
const icon = new Image();
icon.src = iconData;

export class Images extends BaseExample {
  makeLayer(scene: string, atlas: string, provider: DataProvider<ImageInstance>): LayerInitializer {
    return createLayer(ImageLayer, {
      atlas,
      data: provider,
      key: 'images',
      scene,
    });
  }

  makeProvider(): DataProvider<ImageInstance> {
    const imageProvider = new DataProvider<ImageInstance>([]);

    for (let i = 0; i < 25; ++i) {
      for (let k = 0; k < 25; ++k) {
        const image = new ImageInstance({
          element: icon,
          id: `image${i * 100 + k}`,
          scaling: ScaleType.ALWAYS,
          tint: [1.0, 1.0, 1.0, 1.0],
        });

        const aspect = image.width / image.height;
        image.width = 25 * aspect;
        image.height = 25;
        image.x = i * image.width;
        image.y = k * image.height;

        imageProvider.instances.push(image);
      }
    }

    return imageProvider;
  }
}
