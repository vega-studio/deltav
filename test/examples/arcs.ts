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
      scaleType: ArcScaleType.SCREEN_CURVE
    });
  }

  makeProvider(): InstanceProvider<ArcInstance> {
    const arcProvider = new InstanceProvider<ArcInstance>();
    const arcs: ArcInstance[] = [];
    const directions: number[] = [];
    const viewSize =
      this.surface.getViewSize(this.view) ||
      new Bounds({ x: 0, y: 0, width: 200, height: 200 });

    for (let i = 0; i < 21; ++i) {
      const arc = new ArcInstance({
        angle: [-Math.PI, Math.PI],
        center: [viewSize.width / 2, viewSize.height / 2],
        colorEnd: [0.0, 1.0, 0.0, 1.0],
        colorStart: [1.0, 0.0, 1.0, 1.0],
        depth: 10,
        radius: (i + 1) * 4,
        thickness: [3, 3]
      });

      directions[i] = 1;
      arcs.push(arcProvider.add(arc));
    }

    let count: number = 0;
    const stopAngle = -Math.PI + Math.PI / 12;
    setInterval(() => {
      for (let i = 0, end = arcs.length; i < end; i++) {
        const arc = arcs[i];

        // New thickness
        const thicknessToMinus = count >= 5 * i ? 0.015 * directions[i] : 0;
        const newThickness = arc.thickness[0] - thicknessToMinus;
        arc.thickness = [newThickness, newThickness];

        // New angles
        const start = arc.angle[0];
        const toMinus = count >= i * 5 ? Math.PI / 100 * directions[i] : 0;
        let end = arc.angle[1] - toMinus;

        // Change direction
        if (end <= stopAngle) {
          end = stopAngle;
          directions[i] *= -1;
        } else if (end >= Math.PI) {
          end = Math.PI;
          directions[i] *= -1;
        }
        arc.angle = [start, end];
      }
      count++;
    }, 1000 / 60);

    return arcProvider;
  }
}
