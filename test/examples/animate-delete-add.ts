/**
 * This test will test the observable ability to have a projectile be animated and have it removed and added
 * while the Instance continues to be moved around. This will ensure changes do not override removals / adds
 * and vice versa.
 */
import {
  add2,
  CircleInstance,
  CircleLayer,
  createLayer,
  IInstanceProvider,
  InstanceProvider,
  LayerInitializer
} from "src";
import { BaseExample } from "./base-example";

export class AnimateDeleteAdd extends BaseExample {
  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<CircleInstance>
  ): LayerInitializer {
    return createLayer(CircleLayer, {
      data: provider,
      key: "animate-delete-add",
      scene: scene
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

    this.move(circle);

    setInterval(() => {
      circle.color = [1.0, 0.0, 0.0, 1.0];
      circleProvider.remove(circle);
    }, 1000);

    setInterval(() => {
      circle.color = [1.0, 0.0, 1.0, 1.0];
      circleProvider.add(circle);
    }, 2000);

    return circleProvider;
  }

  move = (circle: CircleInstance) => {
    requestAnimationFrame(() => this.move(circle));
    const bounds = this.surface.getViewSize(this.view);
    if (!bounds) return;

    const center = add2(circle.center, [2, 1]);

    if (center[0] > bounds.width) {
      center[0] = 0;
    }

    if (center[1] > bounds.height) {
      center[1] = 0;
    }

    circle.center = center;
  };
}
