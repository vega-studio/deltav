/**
 * This test will test the observable ability to have a projectile be animated and have it removed and added
 * while the Instance continues to be moved around. This will ensure changes do not override removals / adds
 * and vice versa.
 */
import {
  AutoEasingMethod,
  CircleInstance,
  CircleLayer,
  createLayer,
  IInstanceProvider,
  InstanceProvider,
  LayerInitializer,
  nextFrame
} from "../../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class AnimateDeleteAdd extends BaseExample {
  makeLayer(
    _resources: TestResourceKeys,
    provider: InstanceProvider<CircleInstance>
  ): LayerInitializer {
    return createLayer(CircleLayer, {
      animate: {
        center: AutoEasingMethod.linear(1000)
      },
      data: provider,
      key: "animate-delete-add"
    });
  }

  makeProvider(): IInstanceProvider<CircleInstance> {
    const circleProvider = new InstanceProvider<CircleInstance>();

    const circle = circleProvider.add(
      new CircleInstance({
        color: [0.01, 0.1, 1.0, 1.0],
        id: "yay",
        radius: 10,
        center: [0, 0]
      })
    );

    setInterval(() => {
      circle.color = [1.0, 0.0, 0.0, 1.0];
      circleProvider.remove(circle);
    }, 1000);

    setInterval(() => {
      // Wait a tick to make sure the circle is added
      nextFrame(() => {
        const size = this.surface.getViewSize(this.view);
        if (!size) return;

        const start = circle.center;
        circle.color = [1.0, 0.0, 1.0, 1.0];
        circle.center = [
          Math.random() * size.width,
          Math.random() * size.height
        ];

        const easing = circle.getEasing(CircleLayer.attributeNames.center);
        if (easing) {
          easing.setStart(start);
        }
      });

      circleProvider.add(circle);
    }, 2000);

    return circleProvider;
  }
}
