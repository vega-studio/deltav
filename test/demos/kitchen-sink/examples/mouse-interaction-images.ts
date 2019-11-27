import * as anime from "animejs";
import {
  AutoEasingMethod,
  createLayer,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType,
  ScaleMode
} from "../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

const iconData = require("../../../assets/leaf.png");
const icon = new Image();
icon.src = iconData;

export class MouseInteractionImages extends BaseExample {
  isOver = new Map<ImageInstance, anime.AnimeInstance>();
  hasLeft = new Map<ImageInstance, anime.AnimeInstance>();

  handleImageClick = (info: IPickInfo<ImageInstance>) => {
    for (const image of info.instances) {
      image.tint = [0, 1, 0, 1];
    }
  };

  handleImageOver = (info: IPickInfo<ImageInstance>) => {
    for (const image of info.instances) {
      image.maxSize = 50;
    }
  };

  handleImageOut = async (info: IPickInfo<ImageInstance>) => {
    for (const image of info.instances) {
      image.maxSize = 25;
    }
  };

  makeLayer(
    resource: TestResourceKeys,
    provider: InstanceProvider<ImageInstance>
  ): LayerInitializer {
    return createLayer(ImageLayer, {
      animate: {
        size: AutoEasingMethod.easeInOutCubic(500),
        tint: AutoEasingMethod.easeInOutCubic(500)
      },
      atlas: resource.atlas,
      data: provider,
      key: "mouse-interaction-images",
      onMouseClick: this.handleImageClick,
      onMouseOut: this.handleImageOut,
      onMouseOver: this.handleImageOver,
      picking: PickType.SINGLE
    });
  }

  makeProvider(): InstanceProvider<ImageInstance> {
    const provider = new InstanceProvider<ImageInstance>();
    const images: ImageInstance[] = [];

    function sizeImage(image: ImageInstance) {
      image.width = image.sourceWidth;
      image.height = image.sourceHeight;
      image.maxSize = 25;
    }

    // Left Middle left
    images.push(
      provider.add(
        new ImageInstance({
          source: icon,
          scaling: ScaleMode.ALWAYS,
          tint: [1.0, 1.0, 1.0, 1.0],
          origin: [20, 20],
          onReady: sizeImage
        })
      )
    );

    images.push(
      provider.add(
        new ImageInstance({
          source: icon,
          scaling: ScaleMode.BOUND_MAX,
          tint: [1.0, 1.0, 1.0, 1.0],
          origin: [20, 50],
          onReady: sizeImage
        })
      )
    );

    images.push(
      provider.add(
        new ImageInstance({
          source: icon,
          scaling: ScaleMode.NEVER,
          tint: [1.0, 1.0, 1.0, 1.0],
          origin: [20, 80],
          onReady: sizeImage
        })
      )
    );

    return provider;
  }
}
