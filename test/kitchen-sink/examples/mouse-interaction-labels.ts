import * as anime from "animejs";
import {
  AnchorType,
  ChartCamera,
  createLayer,
  InstanceProvider,
  IPickInfo,
  LabelInstance,
  LabelLayer,
  LayerInitializer,
  PickType,
  ReferenceCamera
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class MouseInteractionLabels extends BaseExample {
  isOver = new Map<LabelInstance, anime.AnimeInstance>();
  hasLeft = new Map<LabelInstance, anime.AnimeInstance>();

  handleLabelClick = (info: IPickInfo<LabelInstance>) => {
    for (const label of info.instances) {
      // Anime doesn't seem to do internal array interpolation, so we target the color itself
      // And then apply the color property to the circle in the update ticks to register the deltas
      anime({
        0: 0,
        1: 1,
        2: 0,
        3: 0.2,
        targets: label.color,
        update: () => {
          label.color = label.color;
        }
      });
    }
  };

  handleLabelOver = (info: IPickInfo<LabelInstance>) => {
    for (const label of info.instances) {
      if (!this.isOver.get(label)) {
        const animation = anime({
          duration: 500,
          scale: 1.1,
          targets: label
        });

        this.isOver.set(label, animation);
      }
    }
  };

  handleLabelOut = async (info: IPickInfo<LabelInstance>) => {
    for (const label of info.instances) {
      const animation = this.isOver.get(label);

      if (animation) {
        this.isOver.delete(label);

        const leave = anime({
          duration: 500,
          scale: 1,
          targets: label
        });

        leave.pause();
        this.hasLeft.set(label, leave);

        await animation.finished;

        leave.play();
      }
    }
  };

  makeCamera(defaultCamera: ChartCamera): ChartCamera {
    return new ReferenceCamera({
      base: defaultCamera,
      offsetFilter: (offset: [number, number, number]) => [offset[0], 0, 0],
      scaleFilter: (scale: [number, number, number]) => [scale[0], 1, 1]
    });
  }

  makeLayer(
    resource: TestResourceKeys,
    provider: InstanceProvider<LabelInstance>
  ): LayerInitializer {
    return createLayer(LabelLayer, {
      resourceKey: resource.font,
      data: provider,
      key: "mouse-interaction-labels",
      onMouseClick: this.handleLabelClick,
      onMouseOut: this.handleLabelOut,
      onMouseOver: this.handleLabelOver,
      picking: PickType.ALL
    });
  }

  makeProvider(): InstanceProvider<LabelInstance> {
    const provider = new InstanceProvider<LabelInstance>();

    const label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.TopLeft
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontSize: 20,
      id: `label-vertical-0`,
      text: "TL",
      origin: [20, 20]
    });

    // Left Middle left
    provider.add(label);

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.TopMiddle
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "TM",
        origin: [100, 20]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.TopRight
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "TR",
        origin: [180, 20]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "ML",
        origin: [20, 100]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.Middle
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "M",
        origin: [100, 100]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.MiddleRight
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "MR",
        origin: [180, 100]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.BottomLeft
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "BL",
        origin: [20, 180]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.BottomMiddle
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        id: `label-vertical-0`,
        text: "BM",
        origin: [100, 180]
      })
    );

    provider.add(
      new LabelInstance({
        anchor: {
          padding: 0,
          type: AnchorType.BottomRight
        },
        color: [1.0, 1.0, 1.0, 1.0],
        fontSize: 20,
        text: "BR",
        origin: [180, 180]
      })
    );

    return provider;
  }
}
