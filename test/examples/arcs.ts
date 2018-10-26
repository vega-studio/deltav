import {
  ArcInstance,
  ArcLayer,
  ArcScaleType,
  AutoEasingLoopStyle,
  AutoEasingMethod,
  Bounds,
  createLayer,
  InstanceProvider,
  LayerInitializer
} from "src";
import { BaseExample } from "./base-example";

export class Arcs extends BaseExample {
  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<ArcInstance>
  ): LayerInitializer {
    return createLayer(ArcLayer, {
      animate: {
        angle: AutoEasingMethod.linear(2500, 0, AutoEasingLoopStyle.REFLECT),
        thickness: AutoEasingMethod.linear(2500, 0, AutoEasingLoopStyle.REFLECT)
      },
      data: provider,
      key: "arcs",
      scene: scene,
      scaleType: ArcScaleType.NONE,
      printShader: true
    });
  }

  makeProvider(): InstanceProvider<ArcInstance> {
    const arcProvider = new InstanceProvider<ArcInstance>();
    const arcs: ArcInstance[] = [];
    const directions: number[] = [];
    const viewSize =
      this.surface.getViewSize(this.view) ||
      new Bounds({ x: 0, y: 0, width: 200, height: 200 });

    for (let i = 0; i < 1000; ++i) {
      const arc = new ArcInstance({
        angle: [-Math.PI, -Math.PI],
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
    setTimeout(() => {
      for (let i = 0; i < 1000; ++i) {
        const arc = arcs[i];
        arc.angle = [-Math.PI, Math.PI];
        arc.thickness = [3, 3];

        let easing = arc.getEasing(ArcLayer.attributeNames.angle);
        if (easing) {
          easing.setTiming(i * 100, i * 10);
        }

        easing = arc.getEasing(ArcLayer.attributeNames.thickness);
        if (easing) {
          easing.setTiming(i * 100, i * 10);
        }
      }
    }, 10);

    return arcProvider;
  }
}
