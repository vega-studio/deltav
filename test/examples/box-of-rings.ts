import {
  ChartCamera,
  createLayer,
  InstanceProvider,
  LayerInitializer,
  RingInstance,
  RingLayer
} from "src";
import { BaseExample } from "./base-example";

export class BoxOfRings extends BaseExample {
  camera: ChartCamera;

  makeCamera(defaultCamera: ChartCamera) {
    this.camera = defaultCamera;
    return defaultCamera;
  }

  makeLayer(
    scene: string,
    _atlas: string,
    provider: InstanceProvider<RingInstance>
  ): LayerInitializer {
    return createLayer(RingLayer, {
      data: provider,
      key: "box-of-rings",
      scaleFactor: () => this.camera.scale[0],
      scene: scene
    });
  }

  makeProvider(): InstanceProvider<RingInstance> {
    const ringProvider = new InstanceProvider<RingInstance>();
    const rings: RingInstance[] = [];

    setInterval(() => {
      if (rings.length) {
        const ring = rings.pop();

        if (ring) {
          ringProvider.remove(ring);
        }
      } else {
        for (let i = 0; i < 25; ++i) {
          for (let k = 0; k < 25; ++k) {
            const ring = ringProvider.add(
              new RingInstance({
                color: [Math.random(), Math.random(), Math.random(), 1.0],
                id: `ring_${i}_${k}`,
                radius: 10,
                thickness: 1,
                center: [i * 20, k * 20]
              })
            );

            rings.push(ring);
          }
        }
      }
    }, 1000 / 60);

    return ringProvider;
  }
}
