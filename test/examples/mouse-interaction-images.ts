import * as anime from "animejs";
import {
  createLayer,
  ImageInstance,
  ImageLayer,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType,
  ScaleType
} from "../../src";
import { BaseExample } from "./base-example";

const iconData = require("./images/leaf.png");
const icon = new Image();
icon.src = iconData;

export class MouseInteractionImages extends BaseExample {
  isOver = new Map<ImageInstance, anime.AnimeInstance>();
  hasLeft = new Map<ImageInstance, anime.AnimeInstance>();

  handleImageClick = (info: IPickInfo<ImageInstance>) => {
    for (const image of info.instances) {
      // Anime doesn't seem to do internal array interpolation, so we target the color itself
      // And then apply the color property to the circle in the update ticks to register the deltas
      anime({
        0: 0,
        1: 1,
        2: 0,
        3: 0.1,
        targets: image.tint,
        update: () => {
          image.tint = image.tint;
        }
      });
    }
  };

  handleImageOver = (info: IPickInfo<ImageInstance>) => {
    for (const image of info.instances) {
      if (!this.isOver.get(image)) {
        const animation = anime({
          size: 50,
          targets: image
        });

        this.isOver.set(image, animation);
      }
    }
  };

  handleImageOut = async (info: IPickInfo<ImageInstance>) => {
    for (const image of info.instances) {
      const animation = this.isOver.get(image);

      if (animation) {
        this.isOver.delete(image);

        const leave = anime({
          size: 25,
          targets: image
        });

        leave.pause();
        this.hasLeft.set(image, leave);

        await animation.finished;

        leave.play();
      }
    }
  };

  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<ImageInstance>
  ): LayerInitializer {
    return createLayer(ImageLayer, {
      atlas,
      data: provider,
      key: "mouse-interaction-images",
      onMouseClick: this.handleImageClick,
      onMouseOut: this.handleImageOut,
      onMouseOver: this.handleImageOver,
      picking: PickType.ALL,
      scene: scene
    });
  }

  makeProvider(): InstanceProvider<ImageInstance> {
    const provider = new InstanceProvider<ImageInstance>();
    const images: ImageInstance[] = [];

    const image = new ImageInstance({
      element: icon,
      id: `image_0`,
      scaling: ScaleType.ALWAYS,
      tint: [1.0, 1.0, 1.0, 1.0],
      x: 20,
      y: 20
    });

    // Left Middle left
    images.push(provider.add(image));

    images.push(
      provider.add(
        new ImageInstance({
          element: icon,
          id: `image_1`,
          scaling: ScaleType.BOUND_MAX,
          tint: [1.0, 1.0, 1.0, 1.0],
          x: 20,
          y: 50
        })
      )
    );

    images.push(
      provider.add(
        new ImageInstance({
          element: icon,
          id: `image_2`,
          scaling: ScaleType.NEVER,
          tint: [1.0, 1.0, 1.0, 1.0],
          x: 20,
          y: 80
        })
      )
    );

    images.forEach(image => {
      image.size = 25;
    });

    return provider;
  }
}
