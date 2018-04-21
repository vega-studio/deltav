import * as anime from 'animejs';
import { AnchorType, CircleInstance, createLayer, DataProvider, IPickInfo, LabelInstance, LabelLayer, LayerInitializer, PickType, ScaleType } from '../../src';
import { BaseExample } from './base-example';

export class MouseInteractionLabels extends BaseExample {
  isOver = new Map<CircleInstance, anime.AnimeInstance>();
  hasLeft = new Map<CircleInstance, anime.AnimeInstance>();

  handleLabelClick = (info: IPickInfo<CircleInstance>) => {
    for (const label of info.instances) {
      // Anime doesn't seem to do internal array interpolation, so we target the color itself
      // And then apply the color property to the circle in the update ticks to register the deltas
      anime({
        0: 0,
        1: 1,
        2: 0,
        3: 1,
        targets: label.color,
        update: () => {
          label.color = label.color;
        },
      });
    }
  }

  handleLabelOver = (info: IPickInfo<CircleInstance>) => {
    for (const label of info.instances) {
      if (!this.isOver.get(label)) {
        const animation = anime({
          targets: label,
          x: 50,
        });

        this.isOver.set(label, animation);
      }
    }
  }

  handleLabelOut = async(info: IPickInfo<CircleInstance>) => {
    for (const label of info.instances) {
      const animation = this.isOver.get(label);

      if (animation) {
        this.isOver.delete(label);

        const leave = anime({
          targets: label,
          x: 20,
        });

        leave.pause();
        this.hasLeft.set(label, leave);

        await animation.finished;

        leave.play();
      }
    }
  }

  makeLayer(scene: string, atlas: string, provider: DataProvider<LabelInstance>): LayerInitializer {
    return createLayer(LabelLayer, {
      atlas,
      data: provider,
      key: 'mouse-interaction-labels',
      onMouseClick: this.handleLabelClick,
      onMouseOut: this.handleLabelOut,
      onMouseOver: this.handleLabelOver,
      picking: PickType.ALL,
      scene: scene,
    });
  }

  makeProvider(): DataProvider<LabelInstance> {
    const provider = new DataProvider<LabelInstance>([]);
    let count = 2;

    const label = new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleLeft,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-1`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.NEVER,
      text: 'Scale Type: NEVER',
      x: 20,
      y: count++ * 20,
    });

    // Left Middle left
    provider.instances.push(label);

    provider.instances.push(new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleLeft,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-2`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.ALWAYS,
      text: 'Scale Type: ALWAYS',
      x: 20,
      y: count++ * 20,
    }));

    provider.instances.push(new LabelInstance({
      anchor: {
        padding: 0,
        type: AnchorType.MiddleLeft,
      },
      color: [1.0, 1.0, 1.0, 1.0],
      fontFamily: 'Arial',
      fontSize: 20,
      fontStyle: 'normal',
      fontWeight: 'normal',
      id: `label-vertical-3`,
      rasterization: {
        scale: 1.0,
      },
      scaling: ScaleType.BOUND_MAX,
      text: 'Scale Type: BOUND_MAX',
      x: 20,
      y: count++ * 20,
    }));

    return provider;
  }
}
