import {
  createLayer,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  LayerInitializer,
  ScaleMode
} from "../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

const iconData = require("../../../assets/leaf.png");
const icon = new Image();
icon.src = iconData;

export class Images extends BaseExample {
  makeLayer(
    resource: TestResourceKeys,
    provider: InstanceProvider<ImageInstance>
  ): LayerInitializer {
    return createLayer(ImageLayer, {
      atlas: resource.atlas,
      data: provider,
      key: "images"
    });
  }

  makeProvider(): InstanceProvider<ImageInstance> {
    const imageProvider = new InstanceProvider<ImageInstance>();

    for (let i = 0; i < 25; ++i) {
      for (let k = 0; k < 25; ++k) {
        const image = new ImageInstance({
          source: icon,
          scaling: ScaleMode.ALWAYS,
          tint: [1.0, 1.0, 1.0, Math.random() * 0.8 + 0.2],

          onReady: (image: ImageInstance) => {
            const aspect = image.sourceWidth / image.sourceHeight;
            image.origin = [image.width * 26 * aspect, image.height * 26];
            image.width = 25 * aspect;
            image.height = 25;
          }
        });

        // Store the index in the width and height until it gets established
        image.width = i;
        image.height = k;
        imageProvider.add(image);
      }
    }

    return imageProvider;
  }
}
