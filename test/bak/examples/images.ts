import {
  createLayer,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerInitializer,
  ScaleMode
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

const iconData = require("./images/leaf.png");
const icon = new Image();
icon.src = iconData;

export class Images extends BaseExample {
  makeLayer(
    scene: string,
    resource: TestResourceKeys,
    provider: InstanceProvider<ImageInstance>
  ): LayerInitializer {
    return createLayer(ImageLayer, {
      atlas: resource.atlas,
      data: provider,
      key: "images",
      scene
    });
  }

  makeProvider(): InstanceProvider<ImageInstance> {
    const imageProvider = new InstanceProvider<ImageInstance>();

    for (let i = 0; i < 25; ++i) {
      for (let k = 0; k < 25; ++k) {
        const image = new ImageInstance({
          element: icon,
          id: `image${i * 100 + k}`,
          scaling: ScaleMode.ALWAYS,
          tint: [1.0, 1.0, 1.0, Math.random() * 0.8 + 0.2],
          source: "./images/leaf.png"
        });

        const aspect = image.width / image.height;
        image.width = 25 * aspect;
        image.height = 25;
        image.position = [i * image.width, k * image.height];

        imageProvider.add(image);
      }
    }

    return imageProvider;
  }
}
