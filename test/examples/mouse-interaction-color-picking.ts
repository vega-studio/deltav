import * as anime from 'animejs';
import {
  CircleInstance,
  CircleLayer,
  createLayer,
  EdgeInstance,
  EdgeLayer,
  EdgeType,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType,
} from 'src';
import { BaseExample } from './base-example';

export class MouseInteractionColorPicking extends BaseExample {
  isOver = new Map<CircleInstance, anime.AnimeInstance>();
  hasLeft = new Map<CircleInstance, anime.AnimeInstance>();
  edgeProvider = new InstanceProvider<EdgeInstance>();
  side = 0;

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

  handleEdgeMouseOut = (info: IPickInfo<EdgeInstance>) => {
    this.side = 0;

    anime.remove(info.instances);
    anime({
      targets: info.instances,
      widthEnd: 10,
      widthStart: 10,
    });
  }

  handleEdgeMouseMove = (info: IPickInfo<EdgeInstance>) => {
    if (info.instances.length <= 0) {
      this.side = 0;
      return;
    }

    if (info.world[0] < 100 && this.side !== -1) {
      this.side = -1;
      anime.remove(info.instances);
      anime({
        targets: info.instances,
        widthEnd: 10,
        widthStart: 20,
      });
    }

    if (info.world[0] >= 100 && this.side !== 1) {
      this.side = 1;
      anime.remove(info.instances);
      anime({
        targets: info.instances,
        widthEnd: 20,
        widthStart: 10,
      });
    }
  }

  makeLayer(
    scene: string,
    atlas: string,
    provider: InstanceProvider<CircleInstance>,
  ): LayerInitializer | LayerInitializer[] {
    return [
      createLayer(CircleLayer, {
        data: provider,
        key: 'mouse-interaction-color-picking-1',
        onMouseClick: this.handleCircleClick,
        onMouseOut: this.handleCircleOut,
        onMouseOver: this.handleCircleOver,
        picking: PickType.SINGLE,
        scaleFactor: () => 1,
        scene,
      }),
      createLayer(EdgeLayer, {
        data: this.edgeProvider,
        key: 'mouse-interaction-color-picking-2',
        onMouseMove: this.handleEdgeMouseMove,
        onMouseOut: this.handleEdgeMouseOut,
        picking: PickType.SINGLE,
        scene,
        type: EdgeType.BEZIER2,
      }),
    ];
  }

  makeProvider(): InstanceProvider<CircleInstance> {
    const circleProvider = new InstanceProvider<CircleInstance>();
    const edgeProvider = new InstanceProvider<EdgeInstance>();

    for (let i = 0; i < 40; ++i) {
      for (let k = 0; k < 30; ++k) {
        const circle = new CircleInstance({
          color: [1.0, Math.random(), Math.random(), Math.random() * 0.8 + 0.2],
          id: `circle${i * 100 + k}`,
          radius: 5,
          x: i * 10,
          y: k * 10,
        });

        circleProvider.add(circle);
      }
    }

    const TOTAL_EDGES = 10;

    for (let i = 0; i < TOTAL_EDGES; ++i) {
      const edge = new EdgeInstance({
        colorEnd: [Math.random(), 1.0, Math.random(), 0.25],
        colorStart: [Math.random(), 1.0, Math.random(), 1.0],
        control: [[60, 20 * i + 20], [180, 20 * i + 20]],
        end: [10000, 20 * i + 20],
        id: `edge-interaction-${i}`,
        start: [20, 20 * i + 20],
        widthEnd: 10,
        widthStart: 10,
      });

      edgeProvider.add(edge);
    }

    this.edgeProvider = edgeProvider;
    return circleProvider;
  }
}
