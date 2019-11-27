import {
  ArcInstance,
  ArcLayer,
  ArcScaleType,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  Bounds,
  createLayer,
  InstanceProvider,
  LayerInitializer,
  nextFrame
} from "../../../../src";
import { BaseExample, TestResourceKeys } from "./base-example";

export class Arcs extends BaseExample {
  makeLayer(
    _resource: TestResourceKeys,
    provider: InstanceProvider<ArcInstance>
  ): LayerInitializer {
    return createLayer(ArcLayer, {
      animate: {
        angle: AutoEasingMethod.linear(2500, 0, AutoEasingLoopStyle.REFLECT),
        thickness: AutoEasingMethod.linear(2500, 0, AutoEasingLoopStyle.REFLECT)
      },
      data: provider,
      key: "arcs",
      scaleType: ArcScaleType.NONE
    });
  }

  makeProvider(): InstanceProvider<ArcInstance> {
    const arcProvider = new InstanceProvider<ArcInstance>();
    const arcs: ArcInstance[] = [];
    const directions: number[] = [];
    const viewSize =
      this.surface.getViewSize(this.view) ||
      new Bounds({ x: 0, y: 0, width: 200, height: 200 });
    const arcCount = 15;

    for (let i = 0; i < arcCount; ++i) {
      const arc = new ArcInstance({
        angle: [-Math.PI / 2, -Math.PI / 2],
        center: [viewSize.width / 2, viewSize.height / 2],
        colorEnd: [0.0, 1.0, 0.0, 1.0],
        colorStart: [1.0, 0.0, 1.0, 1.0],
        depth: 10,
        radius: (i + 1) * 4,
        thickness: [0.1, 0.1]
      });

      directions[i] = 1;
      arcs.push(arcProvider.add(arc));
    }

    for (let i = 0; i < arcCount; ++i) {
      const arc = new ArcInstance({
        angle: [-Math.PI / 2, -Math.PI / 2],
        center: [viewSize.width / 2, viewSize.height / 2],
        colorEnd: [0.0, 1.0, 0.0, 1.0],
        colorStart: [1.0, 0.0, 1.0, 1.0],
        depth: 10,
        radius: (i + 1) * 4,
        thickness: [0.1, 0.1]
      });

      directions[i] = 1;
      arcs.push(arcProvider.add(arc));
    }

    // Wait a tick to get the easing properties available
    nextFrame(async () => {
      await nextFrame();
      for (let i = 0; i < arcCount; ++i) {
        const arc = arcs[i];
        arc.angle = [-Math.PI / 2, Math.PI / 2];
        arc.thickness = [3, 3];

        let easing = arc.getEasing(ArcLayer.attributeNames.angle);
        if (easing) {
          easing.setTiming(i * 100, 2000);
        }

        easing = arc.getEasing(ArcLayer.attributeNames.thickness);
        if (easing) {
          easing.setTiming(i * 100, 2000);
        }
      }

      for (let i = arcCount; i < arcCount * 2; ++i) {
        const arc = arcs[i];
        arc.angle = [-Math.PI / 2, -Math.PI / 2 - Math.PI];
        arc.thickness = [3, 3];

        let easing = arc.getEasing(ArcLayer.attributeNames.angle);
        if (easing) {
          easing.setTiming((i - arcCount) * 100, 2000);
        }

        easing = arc.getEasing(ArcLayer.attributeNames.thickness);
        if (easing) {
          easing.setTiming((i - arcCount) * 100, 2000);
        }
      }
    });

    return arcProvider;
  }
}
