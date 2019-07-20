import anime from "animejs";
import {
  AutoEasingMethod,
  BasicCamera2DController,
  Camera2D,
  CircleInstance,
  CircleLayer,
  createLayer,
  InstanceProvider,
  IPickInfo,
  LayerInitializer,
  PickType
} from "src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class MouseInteraction extends BaseExample {
  isOver = new Map<CircleInstance, boolean>();
  hasLeft = new Map<CircleInstance, boolean>();

  makeController(
    defaultCamera: Camera2D,
    _testCamera: Camera2D,
    viewName: string
  ) {
    return new BasicCamera2DController({
      camera: defaultCamera,
      startView: viewName,
      twoFingerPan: true
    });
  }

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
        }
      });
    }
  };

  handleCircleOver = (info: IPickInfo<CircleInstance>) => {
    for (const circle of info.instances) {
      if (!this.isOver.get(circle)) {
        circle.radius = 20;
        this.isOver.set(circle, true);
      }
    }
  };

  handleCircleOut = async (info: IPickInfo<CircleInstance>) => {
    for (const circle of info.instances) {
      const animation = this.isOver.get(circle);

      if (animation) {
        this.isOver.delete(circle);
        circle.radius = 5;
      }
    }
  };

  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<CircleInstance>
  ): LayerInitializer {
    return createLayer(CircleLayer, {
      animate: {
        radius: AutoEasingMethod.easeOutElastic(500)
      },
      data: provider,
      key: "mouse-interaction",
      onMouseClick: this.handleCircleClick,
      onMouseOut: this.handleCircleOut,
      onMouseOver: this.handleCircleOver,
      picking: PickType.SINGLE,
      scaleFactor: () => 1
    });
  }

  makeProvider(): InstanceProvider<CircleInstance> {
    const circleProvider = new InstanceProvider<CircleInstance>();

    for (let i = 0; i < 40; ++i) {
      for (let k = 0; k < 40; ++k) {
        const circle = new CircleInstance({
          color: [1.0, Math.random(), Math.random(), Math.random() * 0.8 + 0.2],
          id: `circle${i * 100 + k}`,
          radius: 5,
          center: [i * 11, k * 11]
        });

        circleProvider.add(circle);
      }
    }

    return circleProvider;
  }
}
