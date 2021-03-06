import anime from "animejs";
import {
  AnchorType,
  Camera2D,
  createLayer,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType,
  RectangleInstance,
  RectangleLayer,
  ReferenceCamera2D,
  ScaleMode
} from "../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class MouseInteractionRectangle extends BaseExample {
  isOver = new Map<RectangleInstance, anime.AnimeInstance>();
  hasLeft = new Map<RectangleInstance, anime.AnimeInstance>();

  handleRectangleClick = (info: IPickInfo<RectangleInstance>) => {
    for (const rectangle of info.instances) {
      // Anime doesn't seem to do internal array interpolation, so we target the color itself
      // And then apply the color property to the rectangle in the update ticks to register the deltas
      anime({
        0: 0,
        1: 1,
        2: 0,
        3: 1,
        targets: rectangle.color,
        update: () => {
          rectangle.color = rectangle.color;
        }
      });
    }
  };

  handleRectangleOver = (info: IPickInfo<RectangleInstance>) => {
    for (const rectangle of info.instances) {
      if (!this.isOver.get(rectangle)) {
        const animation = anime({
          height: 20,
          targets: rectangle,
          width: 20
        });

        this.isOver.set(rectangle, animation);
      }
    }
  };

  handleRectangleOut = async (info: IPickInfo<RectangleInstance>) => {
    for (const rectangle of info.instances) {
      const animation = this.isOver.get(rectangle);

      if (animation) {
        this.isOver.delete(rectangle);

        const leave = anime({
          height: 10,
          targets: rectangle,
          width: 10
        });

        leave.pause();
        this.hasLeft.set(rectangle, leave);

        await animation.finished;

        leave.play();
      }
    }
  };

  makeCamera(defaultCamera: Camera2D): Camera2D {
    return new ReferenceCamera2D({
      base: defaultCamera,
      offsetFilter: (offset: [number, number, number]) => [offset[0], 0, 0],
      scaleFilter: (scale: [number, number, number]) => [scale[0], 1, 1]
    });
  }

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<RectangleInstance>
  ): LayerInitializer {
    return createLayer(RectangleLayer, {
      data: provider,
      key: "mouse-interaction-rectangle",
      onMouseClick: this.handleRectangleClick,
      onMouseOut: this.handleRectangleOut,
      onMouseOver: this.handleRectangleOver,
      picking: PickType.SINGLE
    });
  }

  makeProvider(): InstanceProvider<RectangleInstance> {
    const rectangleProvider = new InstanceProvider<RectangleInstance>();

    for (let i = 0; i < 40; ++i) {
      for (let k = 0; k < 30; ++k) {
        const rectangle = new RectangleInstance({
          anchor: {
            padding: 0,
            type: AnchorType.Middle
          },
          color: [Math.random(), Math.random(), 1.0, Math.random() * 0.8 + 0.2],
          id: `rectangle${i * 100 + k}`,
          scaling: ScaleMode.ALWAYS,
          size: [10, 10],
          position: [i * 10, k * 10]
        });

        rectangleProvider.add(rectangle);
      }
    }

    return rectangleProvider;
  }
}
