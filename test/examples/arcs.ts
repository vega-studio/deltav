import {
  ArcInstance,
  ArcLayer,
  ArcScaleType,
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
      data: provider,
      key: "arcs",
      scene: scene,
      scaleType: ArcScaleType.NONE
    });
  }

  makeProvider(): InstanceProvider<ArcInstance> {
    const arcProvider = new InstanceProvider<ArcInstance>();
    const arcs: ArcInstance[] = [];
    const viewSize =
      this.surface.getViewSize(this.view) ||
      new Bounds({ x: 0, y: 0, width: 200, height: 200 });

    for (let i = 0; i < 1; ++i) {
      const arc = new ArcInstance({
        angle: [Math.random() * Math.PI * 2, Math.random() * Math.PI * 2],
        center: [viewSize.width / 2, viewSize.height / 2],
        colorEnd: [Math.random(), Math.random(), 1.0, 1.0],
        colorStart: [Math.random(), Math.random(), 1.0, 1.0],
        depth: 0,
        radius: (i + 1) * 20,
        thickness: [4, 4]
      });

      arcs.push(arcProvider.add(arc));
    }

    return arcProvider;
  }
}
